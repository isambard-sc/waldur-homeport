import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, ReactNode, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { openportalRemoteProjectsAddNote, openportalRemoteProjectsRetrieve } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { getUser } from '@waldur/workspace/selectors';

import { RemoteProjectStateField } from './RemoteProjectStateField';

const renderLink = (link: any, fallback = '-') => {
  if (!link) return fallback;
  const label = link.id || link.url;
  if (link.url && label) {
    return (
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return label || fallback;
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="col-md-6 mb-2">
    <span className="fw-semibold me-1">{label}:</span>
    <span>{children}</span>
  </div>
);

const SectionHeading = ({ title }: { title: string }) => (
  <div className="col-12 mt-3 mb-1 border-bottom pb-1">
    <span className="text-muted text-uppercase fs-8 fw-bold">{title}</span>
  </div>
);

const JsonBlock = ({ value }: { value: any }) => {
  if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
    return <span className="text-muted">—</span>;
  }
  return (
    <pre className="bg-light rounded p-2 mb-0 fs-8" style={{ maxHeight: 200, overflow: 'auto' }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
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

const parseDetails = (value: any): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return {}; }
  }
  if (typeof value === 'object') return value;
  return {};
};

const DetailsDiff: FC<{ sent: any; confirmed: any }> = ({ sent, confirmed }) => {
  const sentObj = parseDetails(sent);
  const confirmedObj = parseDetails(confirmed);
  const hasBoth = Object.keys(sentObj).length > 0 && Object.keys(confirmedObj).length > 0;
  const keys = Array.from(new Set([...Object.keys(sentObj), ...Object.keys(confirmedObj)])).sort();

  if (keys.length === 0) {
    return <span className="text-muted">—</span>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-sm mb-0 fs-8">
        <thead className="table-light">
          <tr>
            <th style={{ width: '25%' }}>{translate('Field')}</th>
            <th style={{ width: '37.5%' }}>{translate('Last sent')}</th>
            <th style={{ width: '37.5%' }}>
              {translate('Last confirmed')}
              {!confirmed && (
                <span className="ms-1 badge bg-secondary fw-normal">{translate('Not yet confirmed')}</span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const sentVal = sentObj[key];
            const confirmedVal = confirmedObj[key];
            const differs = hasBoth && sortedStringify(sentVal) !== sortedStringify(confirmedVal);
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

const SyncDetailsButton: FC<{ sent: any; confirmed: any }> = ({ sent, confirmed }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline-primary" size="sm" onClick={() => setOpen(true)}>
        {translate('View sync report')}
      </Button>
      {open && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{translate('Sync details comparison')}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setOpen(false)}
                  aria-label={translate('Close')}
                />
              </div>
              <div className="modal-body">
                <DetailsDiff sent={sent} confirmed={confirmed} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


const NotesList: FC<{ uuid: string; initialNotes: any[] }> = ({ uuid, initialNotes }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [notes, setNotes] = useState<any[]>(initialNotes);
  const [text, setText] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      openportalRemoteProjectsAddNote({
        path: { uuid },
        body: { author: user?.full_name || user?.username || '', text },
      }),
    onSuccess: () => {
      setNotes((prev) => [
        ...prev,
        { author: user?.full_name || user?.username || '', text, timestamp: new Date().toISOString() },
      ]);
      setText('');
      dispatch(showSuccess(translate('Note added.')));
    },
    onError: (error) => dispatch(showErrorResponse(error, translate('Unable to add note.'))),
  });

  return (
    <div>
      {notes.length === 0 ? (
        <div className="text-muted mb-2">{translate('No notes yet.')}</div>
      ) : (
        <div className="mb-2">
          {notes.map((note, i) => (
            <div key={i} className="border rounded p-2 mb-1 bg-light">
              <div className="d-flex justify-content-between">
                <strong>{note.author}</strong>
                <small className="text-muted">{formatDateTime(note.timestamp)}</small>
              </div>
              <div>{note.text}</div>
            </div>
          ))}
        </div>
      )}
      <Form onSubmit={(e) => { e.preventDefault(); if (text.trim()) mutate(); }}>
        <Form.Control
          as="textarea"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={translate('Add a note...')}
          className="mb-1"
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

interface Props {
  row: any;
}

export const RemoteProjectExpandableRow: FC<Props> = ({ row }) => {
  const { data: detail, isLoading } = useQuery({
    queryKey: ['remote-project-detail', row.uuid],
    queryFn: async () => {
      const result = await openportalRemoteProjectsRetrieve({ path: { uuid: row.uuid } });
      return result.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const src = detail || row;
  const d = parseDetails(src.award_details);

  const allocation = d.allocation ?? src.current_allocation;
  const breakdown = d.breakdown ?? src.breakdown;
  const linkAward = d.award ?? src.link_award;
  const linkCall = d.call ?? src.link_call;
  const linkProject = d.project_link ?? src.link_project;
  const linkRenewal = d.renewal ?? src.link_renewal;
  const membershipControl = d.membership_control ?? src.membership_control;
  const allowedDomains = d.allowed_domains ?? src.allowed_domains;
  const earliestApprove = d.earliest_approve ?? src.earliest_approve;
  const notes = d.notes ?? src.notes;

  return (
    <ExpandableContainer>
      <div className="row g-0">

        <SectionHeading title={translate('Connection')} />
        <Row label={translate('State')}>
          {row.state ? <RemoteProjectStateField state={row.state} /> : '—'}
        </Row>
        <Row label={translate('Destination')}>{row.destination || '—'}</Row>
        <Row label={translate('Identifier')}>
          {row.identifier || <span className="text-muted">{translate('Not yet assigned')}</span>}
        </Row>
        {row.error_message && (
          <div className="col-12 mb-2">
            <span className="fw-semibold me-1">{translate('Error')}:</span>
            <span className="text-danger">{row.error_message}</span>
          </div>
        )}
        <Row label={translate('Last contact')}>
          {row.last_contact_time ? formatDateTime(row.last_contact_time) : '—'}
        </Row>
        <Row label={translate('Created')}>{formatDateTime(row.created)}</Row>
        <Row label={translate('Modified')}>{formatDateTime(row.modified)}</Row>

        {isLoading && !detail ? (
          <div className="col-12 py-3 text-center text-muted">
            <LoadingSpinnerIcon className="me-1" />
            {translate('Loading details...')}
          </div>
        ) : (
          <>
        <SectionHeading title={translate('Allocation')} />
        <Row label={translate('Current')}>{String(allocation ?? '—')}</Row>
        <Row label={translate('Pending')}>{row.pending_allocation ?? '—'}</Row>
        {breakdown && typeof breakdown === 'object' &&
          Object.keys(breakdown as object).length > 0 && (
            <div className="col-12 mb-2">
              <span className="fw-semibold me-1">{translate('Breakdown')}:</span>
              {Object.entries(breakdown as Record<string, unknown>).map(([k, v]) => (
                <span key={k} className="me-3">{k}: {String(v)}</span>
              ))}
            </div>
          )}

        <SectionHeading title={translate('Links')} />
        <Row label={translate('Award')}>{renderLink(linkAward)}</Row>
        <Row label={translate('Call')}>{renderLink(linkCall)}</Row>
        <Row label={translate('Project')}>{renderLink(linkProject)}</Row>
        <Row label={translate('Renewal')}>{renderLink(linkRenewal)}</Row>

        <SectionHeading title={translate('Access control')} />
        <Row label={translate('Membership control')}>
          {membershipControl ?? <span className="text-muted">{translate('Open')}</span>}
        </Row>
        <Row label={translate('Allowed domains')}>
          {Array.isArray(allowedDomains) && (allowedDomains as string[]).length > 0
            ? (allowedDomains as string[]).join(', ')
            : <span className="text-muted">{translate('All domains')}</span>}
        </Row>

        {/* Privileged fields — null for non-privileged users */}
        {earliestApprove !== null && earliestApprove !== undefined && (
          <>
            <SectionHeading title={translate('Administration')} />
            <Row label={translate('Earliest approve')}>
              {formatDateTime(earliestApprove as string)}
            </Row>
          </>
        )}

        {(src.last_sent_details !== null && src.last_sent_details !== undefined) ||
         (src.last_confirmed_details !== null && src.last_confirmed_details !== undefined) ? (
          <>
            <SectionHeading title={translate('Sync status')} />
            <div className="col-12 mb-2">
              <SyncDetailsButton sent={src.last_sent_details} confirmed={src.last_confirmed_details} />
            </div>
          </>
        ) : null}

        {notes !== null && notes !== undefined && (
          <>
            <SectionHeading title={translate('Notes')} />
            <div className="col-12 mb-2">
              <NotesList
                key={(notes as any[])?.length ?? 0}
                uuid={row.uuid}
                initialNotes={notes as any[]}
              />
            </div>
          </>
        )}

        {src.pending_details !== null && src.pending_details !== undefined && (
          <>
            {src.pending_since && (
              <>
                <SectionHeading title={translate('Pending sync')} />
                <Row label={translate('Pending since')}>{formatDateTime(src.pending_since)}</Row>
              </>
            )}
            <div className="col-12 mb-2">
              <span className="fw-semibold me-1">{translate('Pending details')}:</span>
              <JsonBlock value={src.pending_details} />
            </div>
          </>
        )}
          </>
        )}
      </div>
    </ExpandableContainer>
  );
};
