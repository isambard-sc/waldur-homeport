import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, ReactNode, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useCurrentStateAndParams } from '@uirouter/react';
import {
  openportalRemoteProjectsAddNote,
  openportalRemoteProjectsRetrieve,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser, isOwnerOrStaff, isSupport } from '@waldur/workspace/selectors';

import { RemoteProjectActions } from './RemoteProjectActions';
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

const parseDetails = (value: any): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  if (typeof value === 'object') return value;
  return {};
};

const sortedStringify = (value: unknown): string => {
  if (value === null || value === undefined) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(sortedStringify).join(',')}]`;
  if (typeof value === 'object') {
    const sorted = Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${sortedStringify((value as any)[k])}`);
    return `{${sorted.join(',')}}`;
  }
  return JSON.stringify(value);
};

const renderValue = (v: unknown): ReactNode => {
  if (v === null || v === undefined) return <span className="text-muted">—</span>;
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v !== 'object') return String(v);
  return (
    <pre className="mb-0 fs-8" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(v, null, 2)}
    </pre>
  );
};

// --- Layout primitives ---

const Section: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <Card>
    <Card.Header className="py-2">
      <span className="text-muted text-uppercase fs-8 fw-bold">{title}</span>
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

// --- Sync diff ---

const DetailsDiff: FC<{ sent: any; confirmed: any }> = ({ sent, confirmed }) => {
  const sentObj = parseDetails(sent);
  const confirmedObj = parseDetails(confirmed);
  const hasBoth = Object.keys(sentObj).length > 0 && Object.keys(confirmedObj).length > 0;
  const keys = Array.from(
    new Set([...Object.keys(sentObj), ...Object.keys(confirmedObj)]),
  ).sort();

  if (keys.length === 0) return <span className="text-muted">—</span>;

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-sm mb-0 fs-8">
        <thead className="table-light">
          <tr>
            <th style={{ width: '20%' }}>{translate('Field')}</th>
            <th style={{ width: '40%' }}>{translate('Last sent')}</th>
            <th style={{ width: '40%' }}>
              {translate('Last confirmed')}
              {!confirmed && (
                <span className="ms-1 badge bg-secondary fw-normal">
                  {translate('Not yet confirmed')}
                </span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const sentVal = sentObj[key];
            const confirmedVal = confirmedObj[key];
            const differs =
              hasBoth && sortedStringify(sentVal) !== sortedStringify(confirmedVal);
            return (
              <tr key={key} className={differs ? 'table-warning' : undefined}>
                <td className="fw-semibold align-top">{key}</td>
                <td className="align-top">{renderValue(sentVal)}</td>
                <td className="align-top">{renderValue(confirmedVal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Notes ---

const NotesSection: FC<{
  uuid: string;
  notes: any[];
  onAdded(): Promise<void>;
}> = ({ uuid, notes, onAdded }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [text, setText] = useState('');

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
        <div style={{ maxHeight: 300, overflowY: 'auto' }} className="mb-3 pe-1">
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
  const uuid = params.uuid as string;

  const ownerOrStaff = useSelector(isOwnerOrStaff);
  const support = useSelector(isSupport);
  const canEdit = ownerOrStaff || support;

  const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['remote-project-detail', uuid],
    queryFn: async () => {
      const result = await openportalRemoteProjectsRetrieve({ path: { uuid } });
      return result.data;
    },
    staleTime: 0,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
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

  const d = parseDetails(data.award_details);
  const allocation = d.allocation ?? data.current_allocation;
  const breakdown = (d.breakdown ?? data.breakdown) as Record<string, unknown> | null;
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

  const doRefetch = (): Promise<void> => refetch().then(() => {});

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {data.state && <RemoteProjectStateField state={data.state} />}
          <h4 className="mb-0">{data.current_project_name || '—'}</h4>
          {data.destination && (
            <span className="text-muted fs-6">· {data.destination}</span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {canEdit && <RemoteProjectActions row={data} refetch={doRefetch} />}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={doRefetch}
            disabled={isFetching}
          >
            {isFetching && <LoadingSpinnerIcon className="me-1" />}
            {translate('Refresh')}
          </Button>
        </div>
      </div>

      {dataUpdatedAt > 0 && (
        <div className="text-muted fs-8 mb-3">
          {translate('Last refreshed:')} {formatDateTime(new Date(dataUpdatedAt).toISOString())}
          {' · '}
          {translate('Auto-refreshes every 60s')}
        </div>
      )}

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
          </Section>
        </div>

        {/* Allocation */}
        <div className="col-md-6">
          <Section title={translate('Allocation')}>
            <Field label={translate('Current')}>{String(allocation ?? '—')}</Field>
            <Field label={translate('Pending')}>{data.pending_allocation ?? '—'}</Field>
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
          <Section title={translate('Links')}>
            <Field label={translate('Award')}>{renderLink(linkAward)}</Field>
            <Field label={translate('Call')}>{renderLink(linkCall)}</Field>
            <Field label={translate('Project')}>{renderLink(linkProject)}</Field>
            <Field label={translate('Renewal')}>{renderLink(linkRenewal)}</Field>
          </Section>
        </div>

        {/* Access control */}
        <div className="col-md-6">
          <Section title={translate('Access control')}>
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

        {/* Administration (privileged) */}
        {earliestApprove !== null && earliestApprove !== undefined && (
          <div className="col-md-6">
            <Section title={translate('Administration')}>
              <Field label={translate('Earliest approve')}>
                {formatDateTime(earliestApprove)}
              </Field>
            </Section>
          </div>
        )}

        {/* Sync details */}
        {hasSyncData && (
          <div className="col-12">
            <Section title={translate('Sync details')}>
              <DetailsDiff
                sent={data.last_sent_details}
                confirmed={data.last_confirmed_details}
              />
            </Section>
          </div>
        )}

        {/* Pending sync */}
        {data.pending_details !== null && data.pending_details !== undefined && (
          <div className="col-12">
            <Section title={translate('Pending sync')}>
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

      </div>
    </div>
  );
};
