import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Button, Form, OverlayTrigger, Popover } from 'react-bootstrap';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { openportalManagedProjectAuditList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

import { AuditDateRange } from '../AuditDateRange';
import { DetailsDiff } from '../DetailsDiff';

const EVENT_OPTIONS = [
  { value: 'created', label: 'Created', badge: 'bg-success' },
  { value: 'approved', label: 'Approved', badge: 'bg-success' },
  { value: 'rejected', label: 'Rejected', badge: 'bg-danger' },
  { value: 'deleted', label: 'Deleted', badge: 'bg-danger' },
  { value: 'note_added', label: 'Note added', badge: 'bg-info text-dark' },
  { value: 'details_updated', label: 'Details updated', badge: 'bg-warning text-dark' },
  { value: 'project_attached', label: 'Project attached', badge: 'bg-primary' },
  { value: 'project_detached', label: 'Project detached', badge: 'bg-warning text-dark' },
];

const EVENT_BADGE: Record<string, string> = Object.fromEntries(
  EVENT_OPTIONS.map((e) => [e.value, e.badge]),
);

const EventBadge = ({ type }: { type: string }) => {
  const cls = EVENT_BADGE[type] ?? 'bg-secondary';
  const label = EVENT_OPTIONS.find((e) => e.value === type)?.label ?? type;
  return <span className={`badge ${cls} fw-normal`}>{label}</span>;
};

const ExpandedRow = ({ row }: { row: any }) => {
  const hasNote = !!row.note;
  const hasDiff = row.previous_details != null || row.new_details != null;
  if (!hasNote && !hasDiff) {
    return (
      <p className="text-muted mb-0">{translate('No detail changes recorded for this event.')}</p>
    );
  }
  return (
    <div>
      {hasNote && (
        <div className={hasDiff ? 'mb-3' : undefined}>
          <div className="fw-semibold text-muted fs-8 text-uppercase mb-1">
            {translate('Note')}
          </div>
          <p className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{row.note}</p>
        </div>
      )}
      {hasDiff && (
        <DetailsDiff
          before={row.previous_details}
          after={row.new_details}
          beforeLabel={translate('Previous')}
          afterLabel={translate('New')}
        />
      )}
    </div>
  );
};

const columns = [
  {
    title: translate('Timestamp'),
    render: ({ row }) => formatDateTime(row.timestamp),
    orderField: 'timestamp',
    id: 'timestamp',
    keys: ['timestamp'],
  },
  {
    title: translate('Event'),
    render: ({ row }) => <EventBadge type={row.event_type} />,
    id: 'event_type',
    keys: ['event_type'],
  },
  {
    title: translate('Performed by'),
    render: ({ row }) => row.performed_by_full_name || '—',
    id: 'performed_by',
    keys: ['performed_by_full_name'],
  },
  {
    title: translate('Note'),
    render: ({ row }) => {
      if (!row.note) return <span className="text-muted">—</span>;
      if (row.note.length <= 80) return row.note;
      return (
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="auto"
          overlay={
            <Popover>
              <Popover.Body className="fs-8" style={{ maxWidth: 360, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {row.note}
              </Popover.Body>
            </Popover>
          }
        >
          <span
            className="d-inline-block text-truncate"
            style={{ maxWidth: 240, cursor: 'help', verticalAlign: 'bottom' }}
          >
            {row.note}
          </span>
        </OverlayTrigger>
      );
    },
    id: 'note',
    keys: ['note'],
  },
];

interface Filters {
  q: string;
  event_type: string;
  timestamp_after: string;
  timestamp_before: string;
  o: string;
}

const INITIAL_FILTERS: Filters = { q: '', event_type: '', timestamp_after: '', timestamp_before: '', o: '-timestamp' };

export const ManagedProjectAuditLog = () => {
  const { params } = useCurrentStateAndParams();
  const identifier = params.identifier as string;
  const destination = params.destination as string;
  const router = useRouter();

  useTitle(translate('Audit Log'), '', 'browser');

  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const filter = useMemo(() => ({
    managed_project_identifier: identifier,
    managed_project_destination: destination,
    o: filters.o,
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.event_type ? { event_type: filters.event_type } : {}),
    ...(filters.timestamp_after ? { timestamp_after: filters.timestamp_after } : {}),
    ...(filters.timestamp_before ? { timestamp_before: filters.timestamp_before } : {}),
  }), [identifier, destination, filters]);

  const tableProps = useTable({
    table: 'ManagedProjectAuditLog',
    fetchData: createFetcher(openportalManagedProjectAuditList),
    filter,
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() =>
            router.stateService.go('marketplace-provider-managed-project-detail', {
              identifier,
              destination,
            })
          }
          title={translate('Back to Managed Project')}
        >
          <ArrowLeftIcon size={16} />
        </Button>
        <h4 className="mb-0">{translate('Audit Log')}</h4>
        <span className="text-muted fs-6">· {identifier} / {destination}</span>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-3">
          <Form.Label className="fs-8 text-muted mb-1">{translate('Search')}</Form.Label>
          <Form.Control
            size="sm"
            type="text"
            placeholder={translate('Search notes, details, performer…')}
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <Form.Label className="fs-8 text-muted mb-1">{translate('Event type')}</Form.Label>
          <Form.Select
            size="sm"
            value={filters.event_type}
            onChange={(e) => setFilter('event_type', e.target.value)}
          >
            <option value="">{translate('All events')}</option>
            {EVENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Form.Select>
        </div>
        <div className="col-md-3">
          <Form.Label className="fs-8 text-muted mb-1">{translate('Date range')}</Form.Label>
          <AuditDateRange
            after={filters.timestamp_after}
            before={filters.timestamp_before}
            onChange={(after, before) =>
              setFilters((f) => ({ ...f, timestamp_after: after, timestamp_before: before }))
            }
            onClear={() =>
              setFilters((f) => ({ ...f, timestamp_after: '', timestamp_before: '' }))
            }
          />
        </div>
        <div className="col-md-2">
          <Form.Label className="fs-8 text-muted mb-1">{translate('Sort')}</Form.Label>
          <Form.Select
            size="sm"
            value={filters.o}
            onChange={(e) => setFilter('o', e.target.value)}
          >
            <option value="-timestamp">{translate('Newest first')}</option>
            <option value="timestamp">{translate('Oldest first')}</option>
            <option value="event_type">{translate('Event type A–Z')}</option>
            <option value="-event_type">{translate('Event type Z–A')}</option>
          </Form.Select>
        </div>
        <div className="col-md-1">
          <Button
            variant="outline-secondary"
            size="sm"
            className="w-100"
            onClick={() => setFilters(INITIAL_FILTERS)}
          >
            {translate('Reset')}
          </Button>
        </div>
      </div>

      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('audit entries')}
        showPageSizeSelector
        expandableRow={ExpandedRow}
      />
    </div>
  );
};
