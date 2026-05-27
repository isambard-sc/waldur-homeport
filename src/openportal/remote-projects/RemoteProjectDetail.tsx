import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  CaretDownIcon,
  GearSixIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode, forwardRef, useEffect, useRef, useState } from 'react';
import { Button, Dropdown, Form, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import {
  openportalRemoteProjectsAddNote,
  openportalRemoteProjectsApproveNow,
  openportalRemoteProjectsHoldIndefinitely,
  openportalRemoteProjectsRetrieve,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { useTitle } from '@waldur/navigation/title';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser, isOwnerOrStaff, isSupport } from '@waldur/workspace/selectors';

import { DetailsDiff, parseDetails } from '../DetailsDiff';
import { SetAllowedDomainsDialog } from './actions/SetAllowedDomainsDialog';
import { SetEarliestApproveDialog } from './actions/SetEarliestApproveDialog';
import { SetLinksDialog } from './actions/SetLinksDialog';
import { SetMembershipControlDialog } from './actions/SetMembershipControlDialog';
import { RemoteProjectStateField } from './RemoteProjectStateField';

// --- Helpers ---

const renderLink = (link: any, fallback = '—'): ReactNode => {
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


// --- Layout ---

const GearToggle = forwardRef<HTMLButtonElement, { onClick?: React.MouseEventHandler }>(
  ({ onClick }, ref) => (
    <button
      ref={ref}
      className="btn btn-sm btn-link text-muted p-0 border-0"
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
    >
      <GearSixIcon size={16} />
    </button>
  ),
);
GearToggle.displayName = 'GearToggle';

const Section: FC<{
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}> = ({ title, actions, children, collapsible = false, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <Card>
      <Card.Header
        className="py-2 d-flex align-items-center justify-content-between"
        style={collapsible ? { cursor: 'pointer' } : undefined}
        onClick={collapsible ? () => setCollapsed((c: boolean) => !c) : undefined}
      >
        <span className="text-muted text-uppercase fs-8 fw-bold">{title}</span>
        <div className="d-flex align-items-center gap-2">
          {actions && (
            <div onClick={(e) => e.stopPropagation()}>{actions}</div>
          )}
          {collapsible && (
            <CaretDownIcon
              size={14}
              className="text-muted"
              style={{
                transform: collapsed ? 'rotate(-90deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            />
          )}
        </div>
      </Card.Header>
      {!collapsed && <Card.Body className="py-3">{children}</Card.Body>}
    </Card>
  );
};

const Field: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <div className="row mb-2">
    <div className="col-5 fw-semibold text-muted">{label}</div>
    <div className="col-7">{children}</div>
  </div>
);

// --- Notes ---

const NotesSection: FC<{
  uuid: string;
  notes: any[];
  onAdded(): Promise<void>;
}> = ({ uuid, notes, onAdded }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      openportalRemoteProjectsAddNote({
        path: { uuid },
        body: { author: user?.full_name || user?.username || '', text },
      }),
    onSuccess: async () => {
      setText('');
      dispatch(showSuccess(translate('Note added.')));
      await onAdded();
    },
    onError: (error) => dispatch(showErrorResponse(error, translate('Unable to add note.'))),
  });

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
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) mutate();
        }}
      >
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

export const RemoteProjectDetail = () => {
  const { params } = useCurrentStateAndParams();
  const uuid = params.remoteProjectUuid as string;
  const router = useRouter();
  const dispatch = useDispatch();

  const ownerOrStaff = useSelector(isOwnerOrStaff);
  const support = useSelector(isSupport);
  const canEdit = ownerOrStaff || support;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['remote-project-detail', uuid],
    queryFn: async () => {
      const result = await openportalRemoteProjectsRetrieve({ path: { uuid } });
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

  const { mutate: approveNow } = useMutation({
    mutationFn: () =>
      openportalRemoteProjectsApproveNow({
        path: { uuid },
        body: { destination: data?.destination ?? '', identifier: data?.identifier ?? '' },
      }),
    onSuccess: async () => {
      dispatch(showSuccess(translate('Remote project will be approved immediately.')));
      await doRefetch();
    },
    onError: (error) =>
      dispatch(showErrorResponse(error, translate('Unable to approve remote project.'))),
  });

  const { mutate: holdIndefinitely } = useMutation({
    mutationFn: () =>
      openportalRemoteProjectsHoldIndefinitely({
        path: { uuid },
        body: { destination: data?.destination ?? '', identifier: data?.identifier ?? '' },
      }),
    onSuccess: async () => {
      dispatch(showSuccess(translate('Remote project is now held indefinitely.')));
      await doRefetch();
    },
    onError: (error) =>
      dispatch(showErrorResponse(error, translate('Unable to hold remote project.'))),
  });

  useTitle(data?.current_project_name || translate('Remote Project'), '', 'browser');

  if (isLoading && !data) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 text-muted">
        <LoadingSpinnerIcon className="me-2" />
        {translate('Loading...')}
      </div>
    );
  }

  if (!data) return null;

  const openLinks = () =>
    dispatch(openModalDialog(SetLinksDialog, { row: data, resolve: { refetch: doRefetch }, dialogClassName: 'modal-dialog-centered' }));
  const openMembership = () =>
    dispatch(openModalDialog(SetMembershipControlDialog, { row: data, resolve: { refetch: doRefetch }, dialogClassName: 'modal-dialog-centered' }));
  const openAllowedDomains = () =>
    dispatch(openModalDialog(SetAllowedDomainsDialog, { row: data, resolve: { refetch: doRefetch }, dialogClassName: 'modal-dialog-centered' }));
  const openEarliestApprove = () =>
    dispatch(openModalDialog(SetEarliestApproveDialog, { row: data, resolve: { refetch: doRefetch }, dialogClassName: 'modal-dialog-centered' }));

  const d = parseDetails(data.award_details);
  const confirmed = parseDetails(data.last_confirmed_details);
  const pending = parseDetails(data.pending_details);
  const allocation = confirmed.allocation ?? data.current_allocation;
  const breakdown = (confirmed.breakdown ?? data.breakdown) as Record<string, unknown> | null;
  const pendingAllocation = pending.allocation ?? data.pending_allocation;
  const pendingAllocationDiffers =
    pendingAllocation != null &&
    (allocation == null || String(pendingAllocation) !== String(allocation));
  const linkAward = d.award ?? data.link_award;
  const linkCall = d.call ?? data.link_call;
  const linkProject = d.project_link ?? data.link_project;
  const linkRenewal = d.renewal ?? data.link_renewal;
  const membershipControl = (d.membership_control ?? data.membership_control) as string | null;
  const allowedDomains = (d.allowed_domains ?? data.allowed_domains) as string[] | null;
  const earliestApprove = (d.earliest_approve ?? data.earliest_approve) as string | null;
  const notes = (d.notes ?? data.notes) as any[] | null;
  const hasSyncData =
    (data.last_sent_details !== null && data.last_sent_details !== undefined) ||
    (data.last_confirmed_details !== null && data.last_confirmed_details !== undefined);

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => router.stateService.go('organization-remote-projects')}
            title={translate('Back to Remote Projects')}
          >
            <ArrowLeftIcon size={16} />
          </Button>
          {data.state && <RemoteProjectStateField state={data.state} />}
          <h4 className="mb-0">{data.current_project_name || '—'}</h4>
          {data.destination && (
            <span className="text-muted fs-6">· {data.destination}</span>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() =>
              router.stateService.go('organization-remote-project-audit', {
                remoteProjectUuid: uuid,
              })
            }
          >
            {translate('Audit Log')}
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={doRefetch}
            disabled={isFetching}
          >
            {isFetching && <LoadingSpinnerIcon className="me-1" />}
            {translate('Refresh')}
          </Button>
        </div>
      </div>

      {data.error_message && (
        <div className="alert alert-danger py-2 mb-3">
          <strong>{translate('Error')}:</strong> {data.error_message}
        </div>
      )}

      <div className="row g-3">

        {/* Connection */}
        <div className="col-md-6">
          <Section title={translate('Connection')}>
            <Field label={translate('Identifier')}>
              {data.identifier || (
                <span className="text-muted">{translate('Not yet assigned')}</span>
              )}
            </Field>
            <Field label={translate('Last contact')}>
              {data.last_contact_time ? formatDateTime(data.last_contact_time) : '—'}
            </Field>
            <Field label={translate('Created')}>{formatDateTime(data.created)}</Field>
            <Field label={translate('Modified')}>{formatDateTime(data.modified)}</Field>
            {data.state === 'pending' && (
              <Field label={translate('State')}>
                <RemoteProjectStateField state={data.state} />
              </Field>
            )}
            {data.pending_since && (
              <Field label={translate('Pending since')}>
                {formatDateTime(data.pending_since)}
              </Field>
            )}
          </Section>
        </div>

        {/* Allocation */}
        <div className="col-md-6">
          <Section title={translate('Allocation')}>
            <Field label={translate('Current')}>{String(allocation ?? '—')}</Field>
            {pendingAllocationDiffers && (
              <Field label={translate('Pending')}>
                <strong>{String(pendingAllocation)}</strong>
              </Field>
            )}
            {breakdown && Object.keys(breakdown).length > 0 && (
              <>
                <div className="fw-semibold text-muted mt-2 mb-1 fs-8 text-uppercase">
                  {translate('Breakdown')}
                </div>
                {Object.entries(breakdown).map(([k, v]) => (
                  <Field key={k} label={k}>{String(v)}</Field>
                ))}
              </>
            )}
          </Section>
        </div>

        {/* Links */}
        <div className="col-md-6">
          <Section
            title={translate('Links')}
            actions={
              canEdit && (
                <button
                  className="btn btn-sm btn-link text-muted p-0 border-0"
                  onClick={openLinks}
                  title={translate('Edit links')}
                >
                  <GearSixIcon size={16} />
                </button>
              )
            }
          >
            <Field label={translate('Award')}>{renderLink(linkAward)}</Field>
            <Field label={translate('Call')}>{renderLink(linkCall)}</Field>
            <Field label={translate('Project')}>{renderLink(linkProject)}</Field>
            <Field label={translate('Renewal')}>{renderLink(linkRenewal)}</Field>
          </Section>
        </div>

        {/* Membership control */}
        <div className="col-md-6">
          <Section
            title={translate('Membership')}
            actions={
              canEdit && (
                <Dropdown align="end">
                  <Dropdown.Toggle as={GearToggle} />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={openMembership}>
                      {translate('Set membership control')}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={openAllowedDomains}>
                      {translate('Set allowed domains')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )
            }
          >
            <Field label={translate('Membership control')}>
              {membershipControl ?? (
                <span className="text-muted">{translate('Open')}</span>
              )}
            </Field>
            <Field label={translate('Allowed domains')}>
              {Array.isArray(allowedDomains) && allowedDomains.length > 0
                ? allowedDomains.join(', ')
                : <span className="text-muted">{translate('All domains')}</span>}
            </Field>
          </Section>
        </div>

        {/* Embargo (privileged) */}
        {earliestApprove !== null && earliestApprove !== undefined && (
          <div className="col-md-6">
            <Section
              title={translate('Embargo')}
              actions={
                canEdit && (
                  <Dropdown align="end">
                    <Dropdown.Toggle as={GearToggle} />
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={openEarliestApprove}>
                        {translate('Set earliest approve')}
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => approveNow()}>
                        {translate('Approve now')}
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => holdIndefinitely()}>
                        {translate('Hold indefinitely')}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )
              }
            >
              <Field label={translate('Earliest approve')}>
                {formatDateTime(earliestApprove)}
              </Field>
            </Section>
          </div>
        )}

        {/* Notes (privileged) */}
        {notes !== null && notes !== undefined && (
          <div className="col-12">
            <Section title={translate('Notes')}>
              <NotesSection
                uuid={data.uuid}
                notes={notes as any[]}
                onAdded={doRefetch}
              />
            </Section>
          </div>
        )}

        {/* Sync details */}
        {hasSyncData && (
          <div className="col-12">
            <Section title={translate('Sync details')} collapsible defaultCollapsed>
              <DetailsDiff
                before={data.last_sent_details}
                after={data.last_confirmed_details}
                beforeLabel={translate('Last sent')}
                afterLabel={translate('Last confirmed')}
                afterNote={
                  !data.last_confirmed_details && (
                    <span className="badge bg-secondary fw-normal">
                      {translate('Not yet confirmed')}
                    </span>
                  )
                }
              />
            </Section>
          </div>
        )}

        {/* Pending sync */}
        {data.pending_details !== null && data.pending_details !== undefined && (
          <div className="col-12">
            <Section title={translate('Pending sync')} collapsible defaultCollapsed>
              {data.pending_since && (
                <Field label={translate('Pending since')}>
                  {formatDateTime(data.pending_since)}
                </Field>
              )}
              <pre
                className="bg-light rounded p-2 mb-0 fs-8"
                style={{ maxHeight: 200, overflow: 'auto' }}
              >
                {JSON.stringify(data.pending_details, null, 2)}
              </pre>
            </Section>
          </div>
        )}

      </div>
    </div>
  );
};
