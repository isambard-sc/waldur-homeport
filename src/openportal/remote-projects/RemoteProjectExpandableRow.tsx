import { FC, ReactNode } from 'react';
import type { RemoteProject } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

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

interface Props {
  row: RemoteProject;
}

export const RemoteProjectExpandableRow: FC<Props> = ({ row }) => (
  <ExpandableContainer>
    <div className="row g-0">

      <SectionHeading title={translate('Connection')} />
      <Row label={translate('State')}>
        {row.state ? <RemoteProjectStateField state={row.state} /> : '—'}
      </Row>
      <Row label={translate('Destination')}>{row.destination || '—'}</Row>
      <Row label={translate('Identifier')}>{row.identifier || <span className="text-muted">{translate('Not yet assigned')}</span>}</Row>
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
              <span key={k} className="me-3">
                {k}: {String(v)}
              </span>
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
        <div className="col-12 mb-2">
          <span className="fw-semibold">{translate('Notes')}:</span>
          {Array.isArray(row.notes) && row.notes.length === 0 ? (
            <span className="ms-2 text-muted">{translate('None')}</span>
          ) : (
            <div className="mt-1">
              {(row.notes as any[]).map((note, i) => (
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
        </div>
      )}

      {row.pending_details !== null && row.pending_details !== undefined && (
        <>
          {row.pending_since === null
            ? null
            : (
              <SectionHeading title={translate('Pending sync')} />
            )}
          {row.pending_since && (
            <Row label={translate('Pending since')}>{formatDateTime(row.pending_since)}</Row>
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
