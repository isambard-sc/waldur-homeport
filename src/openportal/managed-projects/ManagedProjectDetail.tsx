import { useQuery } from '@tanstack/react-query';
import { ArrowDownIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { openportalManagedProjectsRetrieveGet } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import type { AwardDetails } from '../bindings/AwardDetails';
import type { Link as AwardLink } from '../bindings/Link';
import type { Note } from '../bindings/Note';
import { post } from '../api';
import { embargoedUntil } from './utils';
import { ApproveManagedProjectButton } from './ApproveManagedProjectButton';
import { AttachManagedProjectButton } from './AttachManagedProjectButton';
import { DeleteManagedProjectButton } from './DeleteManagedProjectButton';
import { DetachManagedProjectButton } from './DetachManagedProjectButton';
import { RejectManagedProjectButton } from './RejectManagedProjectButton';

// --- Helpers ---

const renderLink = (link: AwardLink | null | undefined, fallback = '—'): ReactNode => {
  if (!link) return <span className="text-muted">{fallback}</span>;
  const label = link.id || link.url;
  if (link.url && label)
    return (
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  return <span>{label || fallback}</span>;
};

const renderAllowedDomains = (domains: string[] | null | undefined): ReactNode => {
  if (domains === null || domains === undefined)
    return <span className="text-muted">{translate('All domains allowed')}</span>;
  if (domains.length === 0)
    return <span className="text-muted">{translate('No domains allowed')}</span>;
  return <span>{domains.join(', ')}</span>;
};

const renderOffering = (destination: string): string => {
  if (!destination) return '—';
  const parts = destination.split('.');
  return parts[parts.length - 1];
};

const stringifyRole = (role: any, projectTemplate: any): string => {
  if (!role) return translate('No role assigned');
  if (!projectTemplate?.role_mapping) return translate('Will not be added to project');
  let mapped: any = projectTemplate.role_mapping[role];
  if (!mapped) {
    mapped = (
      Object.entries(projectTemplate.role_mapping).find(
        ([key]) => key.toLowerCase() === String(role).toLowerCase(),
      ) as any
    )?.[1];
    if (!mapped)
      return `${role} ${translate('has no mapping - will not be added to project')}`;
  }
  return mapped.description || mapped.name || mapped.uuid || translate('Not set');
};

// --- Layout ---

const Section: FC<{ title: string; actions?: ReactNode; children: ReactNode }> = ({
  title,
  actions,
  children,
}) => (
  <Card>
    <Card.Header className="py-2 d-flex align-items-center justify-content-between">
      <span className="text-muted text-uppercase fs-8 fw-bold">{title}</span>
      {actions && <div>{actions}</div>}
    </Card.Header>
    <Card.Body className="py-3">{children}</Card.Body>
  </Card>
);

const Field: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row mb-2">
    <div className="col-5 fw-semibold text-muted">{label}</div>
    <div className="col-7">{children}</div>
  </div>
);

// --- Delete action that navigates back instead of refetching a deleted record ---

const DeleteAndGoBack: FC<{ row: any; refetch?: any }> = ({ row }) => {
  const router = useRouter();
  const navigateBack = () =>
    router.stateService.go('marketplace-provider-managed-projects');
  return <DeleteManagedProjectButton row={row} refetch={navigateBack} />;
};

// --- Notes ---

const NotesSection: FC<{
  identifier: string;
  destination: string;
  notes: Note[];
  onAdded(): Promise<void>;
}> = ({ identifier, destination, notes, onAdded }) => {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsPending(true);
    try {
      await post(
        `/openportal-managed-projects/${identifier}/${destination}/add-note/`,
        { text },
      );
      setText('');
      dispatch(showSuccess(translate('Note added.')));
      await onAdded();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to add note.')));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      {notes.length > 0 ? (
        <>
          <div
            ref={scrollRef}
            style={{ maxHeight: 300, overflowY: 'auto' }}
            className="mb-1 pe-1"
          >
            {notes.map((note, i) => (
              <div key={i} className="border rounded p-2 mb-1 bg-light">
                <div className="d-flex justify-content-between align-items-baseline">
                  <strong>{note.author}</strong>
                  <small className="text-muted ms-2">{formatDateTime(note.timestamp)}</small>
                </div>
                <div className="mt-1">{note.text}</div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-sm btn-secondary w-100 d-flex justify-content-center align-items-center py-1 mb-2"
            onClick={scrollToBottom}
            title={translate('Scroll to latest')}
          >
            <ArrowDownIcon size={14} />
          </button>
        </>
      ) : (
        <div className="text-muted mb-3">{translate('No notes yet.')}</div>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Control
          as="textarea"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={translate('Add a note...')}
          className="mb-2"
          disabled={isPending}
        />
        <Button type="submit" size="sm" disabled={isPending || !text.trim()}>
          {isPending && <LoadingSpinnerIcon className="me-1" />}
          {translate('Add note')}
        </Button>
      </Form>
    </div>
  );
};

// --- Main page ---

export const ManagedProjectDetail = () => {
  const { params } = useCurrentStateAndParams();
  const identifier = params.identifier as string;
  const destination = params.destination as string;
  const router = useRouter();

  const goBack = () =>
    router.stateService.go('marketplace-provider-managed-projects');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['managed-project-detail', identifier, destination],
    queryFn: async () => {
      const result = await openportalManagedProjectsRetrieveGet({
        path: { identifier, destination },
      });
      return result.data;
    },
    staleTime: 0,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const doRefetch = async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 500));
    await refetch();
  };

  useTitle(
    data
      ? ((data.details as AwardDetails).name || translate('Managed Project'))
      : translate('Managed Project'),
    '',
    'browser',
  );

  if (isLoading && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 text-muted">
        <LoadingSpinnerIcon className="me-2" />
        {translate('Loading...')}
      </div>
    );
  }

  if (!data) return null;

  const details = data.details as AwardDetails;
  const embargo = embargoedUntil(data);
  const notes: Note[] = details.notes ?? [];

  const stateVariant =
    data.state === 'approved'
      ? 'bg-success'
      : data.state === 'rejected'
        ? 'bg-danger'
        : data.state === 'pending'
          ? 'bg-warning text-dark'
          : 'bg-secondary';

  const actions = [
    data.state !== 'approved' ? ApproveManagedProjectButton : null,
    data.state !== 'rejected' ? RejectManagedProjectButton : null,
    !data.project ? AttachManagedProjectButton : null,
    data.project ? DetachManagedProjectButton : null,
    DeleteAndGoBack,
  ].filter(Boolean);

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={goBack}
            title={translate('Back to Managed Projects')}
          >
            <ArrowLeftIcon size={16} />
          </Button>
          <span className={`badge ${stateVariant}`}>
            {data.state}
            {embargo && <span className="ms-1">{translate('· Embargoed')}</span>}
          </span>
          <h4 className="mb-0">{details.name || '—'}</h4>
          {data.destination && (
            <span className="text-muted fs-6">· {renderOffering(data.destination)}</span>
          )}
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={doRefetch}
            disabled={isFetching}
          >
            {isFetching && <LoadingSpinnerIcon className="me-1" />}
            {translate('Refresh')}
          </Button>
          <ActionsDropdown row={data} refetch={doRefetch} actions={actions} />
        </div>
      </div>

      <div className="row g-3">

        {/* Project */}
        <div className="col-md-6">
          <Section title={translate('Project')}>
            <Field label={translate('Name')}>
              {details.name || <span className="text-muted">—</span>}
            </Field>
            <Field label={translate('Waldur project')}>
              {(data.project_data as any)?.uuid ? (
                <a href={`/projects/${(data.project_data as any).uuid}/`}>
                  {(data.project_data as any).name || translate('Unnamed Project')}
                </a>
              ) : (
                <span className="text-muted">{translate('No project assigned')}</span>
              )}
            </Field>
            <Field label={translate('Offering')}>{renderOffering(data.destination)}</Field>
            <Field label={translate('Template')}>
              {(data.project_template_data as any)?.uuid ? (
                <Link
                  state="marketplace-provider-project-template-detail"
                  params={{ uuid: (data.project_template_data as any).uuid }}
                >
                  {(data.project_template_data as any).name || details.template || translate('Template')}
                </Link>
              ) : details.template ? (
                details.template
              ) : (
                <span className="text-muted">{translate('Not assigned')}</span>
              )}
            </Field>
            <Field label={translate('Description')}>
              {details.description || <span className="text-muted">—</span>}
            </Field>
          </Section>
        </div>

        {/* Dates */}
        <div className="col-md-6">
          <Section title={translate('Dates')}>
            <Field label={translate('Created')}>{formatDateTime(data.created)}</Field>
            <Field label={translate('Start date')}>
              {details.start_date ? formatDate(details.start_date) : '—'}
            </Field>
            <Field label={translate('End date')}>
              {details.end_date ? formatDate(details.end_date) : '—'}
            </Field>
          </Section>
        </div>

        {/* Allocation */}
        <div className="col-md-6">
          <Section title={translate('Allocation')}>
            <Field label={translate('Allocation')}>
              {details.allocation || <span className="text-muted">—</span>}
            </Field>
            {details.breakdown && Object.keys(details.breakdown).length > 0 && (
              <>
                <div className="fw-semibold text-muted mt-2 mb-1 fs-8 text-uppercase">
                  {translate('Breakdown')}
                </div>
                {Object.entries(details.breakdown).map(([k, v]) => (
                  <Field key={k} label={k}>{String(v)}</Field>
                ))}
              </>
            )}
          </Section>
        </div>

        {/* Review */}
        <div className="col-md-6">
          <Section title={translate('Review')}>
            <Field label={translate('State')}>
              <span className={`badge ${stateVariant}`}>{data.state}</span>
              {embargo && (
                <span className="badge bg-warning text-dark ms-1">
                  {translate('Embargoed')}
                </span>
              )}
            </Field>
            <Field label={translate('Remote identifier')}>
              {data.identifier || <span className="text-muted">{translate('Not yet assigned')}</span>}
            </Field>
            <Field label={translate('Local identifier')}>
              {(data as any).local_identifier || <span className="text-muted">—</span>}
            </Field>
            <Field label={translate('Reviewed by')}>
              {(data as any).reviewed_by_full_name || (
                <span className="text-muted">{translate('Not yet reviewed')}</span>
              )}
            </Field>
            <Field label={translate('Comment')}>
              {(data as any).review_comment || <span className="text-muted">—</span>}
            </Field>
          </Section>
        </div>

        {/* Members */}
        <div className="col-12">
          <Section title={translate('Members')}>
            {!details.members || Object.keys(details.members).length === 0 ? (
              <span className="text-muted">{translate('No members assigned')}</span>
            ) : (
              <div>
                {Object.entries(details.members).map(([email, role]) => (
                  <div key={email} className="row mb-1">
                    <div className="col-md-5 text-break">{email}</div>
                    <div className="col-md-7 text-muted fs-8">
                      {stringifyRole(role, data.project_template_data)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Links */}
        <div className="col-md-6">
          <Section title={translate('Links')}>
            <Field label={translate('Award')}>{renderLink(details.award)}</Field>
            <Field label={translate('Call')}>{renderLink(details.call)}</Field>
            <Field label={translate('Project link')}>{renderLink(details.project_link)}</Field>
            <Field label={translate('Renewal')}>{renderLink(details.renewal)}</Field>
          </Section>
        </div>

        {/* Access control */}
        <div className="col-md-6">
          <Section title={translate('Access control')}>
            <Field label={translate('Membership control')}>
              {details.membership_control ?? (
                <span className="text-muted">{translate('Open')}</span>
              )}
            </Field>
            <Field label={translate('Allowed domains')}>
              {renderAllowedDomains(details.allowed_domains)}
            </Field>
          </Section>
        </div>

        {/* Embargo (privileged, conditional) */}
        {details.earliest_approve && (
          <div className="col-md-6">
            <Section title={translate('Embargo')}>
              <Field label={translate('Earliest approve')}>
                {formatDateTime(details.earliest_approve)}
              </Field>
            </Section>
          </div>
        )}

        {/* Notes */}
        <div className="col-12">
          <Section title={translate('Notes')}>
            <NotesSection
              identifier={data.identifier}
              destination={data.destination}
              notes={notes}
              onAdded={doRefetch}
            />
          </Section>
        </div>

      </div>
    </div>
  );
};
