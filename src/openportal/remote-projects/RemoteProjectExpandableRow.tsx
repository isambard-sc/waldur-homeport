import { useMutation } from '@tanstack/react-query';
import { FC, ReactNode, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { openportalRemoteProjectsAddNote } from 'waldur-js-client';

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

export const RemoteProjectExpandableRow: FC<Props> = ({ row }) => (
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

      <SectionHeading title={translate('Allocation')} />
      <Row label={translate('Current')}>{row.current_allocation ?? '—'}</Row>
      <Row label={translate('Pending')}>{row.pending_allocation ?? '—'}</Row>
      {row.breakdown && typeof row.breakdown === 'object' &&
        Object.keys(row.breakdown).length > 0 && (
          <div className="col-12 mb-2">
            <span className="fw-semibold me-1">{translate('Breakdown')}:</span>
            {Object.entries(row.breakdown as Record<string, unknown>).map(([k, v]) => (
              <span key={k} className="me-3">{k}: {String(v)}</span>
            ))}
          </div>
        )}

      <SectionHeading title={translate('Links')} />
      <Row label={translate('Award')}>{renderLink(row.link_award)}</Row>
      <Row label={translate('Call')}>{renderLink(row.link_call)}</Row>
      <Row label={translate('Project')}>{renderLink(row.link_project)}</Row>
      <Row label={translate('Renewal')}>{renderLink(row.link_renewal)}</Row>

      <SectionHeading title={translate('Access control')} />
      <Row label={translate('Membership control')}>
        {row.membership_control ?? <span className="text-muted">{translate('Open')}</span>}
      </Row>
      <Row label={translate('Allowed domains')}>
        {Array.isArray(row.allowed_domains) && row.allowed_domains.length > 0
          ? (row.allowed_domains as string[]).join(', ')
          : <span className="text-muted">{translate('All domains')}</span>}
      </Row>

      {/* Privileged fields — null for non-privileged users */}
      {row.earliest_approve !== null && row.earliest_approve !== undefined && (
        <>
          <SectionHeading title={translate('Administration')} />
          <Row label={translate('Earliest approve')}>
            {formatDateTime(row.earliest_approve)}
          </Row>
        </>
      )}

      {row.notes !== null && row.notes !== undefined && (
        <>
          <SectionHeading title={translate('Notes')} />
          <div className="col-12 mb-2">
            <NotesList uuid={row.uuid} initialNotes={row.notes as any[]} />
          </div>
        </>
      )}

      {row.pending_details !== null && row.pending_details !== undefined && (
        <>
          {row.pending_since && (
            <>
              <SectionHeading title={translate('Pending sync')} />
              <Row label={translate('Pending since')}>{formatDateTime(row.pending_since)}</Row>
            </>
          )}
          <div className="col-12 mb-2">
            <span className="fw-semibold me-1">{translate('Pending details')}:</span>
            <JsonBlock value={row.pending_details} />
          </div>
        </>
      )}

      {row.last_sent_details !== null && row.last_sent_details !== undefined && (
        <div className="col-12 mb-2">
          <span className="fw-semibold me-1">{translate('Last sent details')}:</span>
          <JsonBlock value={row.last_sent_details} />
        </div>
      )}

      {row.last_confirmed_details !== null && row.last_confirmed_details !== undefined && (
        <div className="col-12 mb-2">
          <span className="fw-semibold me-1">{translate('Last confirmed details')}:</span>
          <JsonBlock value={row.last_confirmed_details} />
        </div>
      )}
    </div>
  </ExpandableContainer>
);
