import { ArrowLeftIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useRouter } from '@uirouter/react';
import { openportalRemoteProjectAuditList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Link } from '@waldur/core/Link';
import { useTitle } from '@waldur/navigation/title';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

import { DetailsDiff, renderValue, parseDetails } from '../DetailsDiff';

const EVENT_OPTIONS = [
  { value: 'award_attempted', label: 'Award attempted', badge: 'bg-primary' },
  { value: 'award_rejected', label: 'Award rejected', badge: 'bg-danger' },
  { value: 'award_created', label: 'Award created', badge: 'bg-success' },
  { value: 'award_confirmed', label: 'Award confirmed', badge: 'bg-success' },
  { value: 'award_updated', label: 'Award updated', badge: 'bg-warning text-dark' },
  { value: 'award_update_confirmed', label: 'Award update confirmed', badge: 'bg-success' },
  { value: 'award_update_rejected', label: 'Award update rejected', badge: 'bg-danger' },
  { value: 'award_fetched', label: 'Award fetched', badge: 'bg-info text-dark' },
  { value: 'allocation_changed', label: 'Allocation changed', badge: 'bg-warning text-dark' },
  { value: 'allocation_confirmed', label: 'Allocation confirmed', badge: 'bg-success' },
  { value: 'allocation_rejected', label: 'Allocation rejected', badge: 'bg-danger' },
  { value: 'project_attached', label: 'Project attached', badge: 'bg-primary' },
  { value: 'project_detached', label: 'Project detached', badge: 'bg-warning text-dark' },
  { value: 'state_changed', label: 'State changed', badge: 'bg-info text-dark' },
  { value: 'resource_deleted', label: 'Resource deleted', badge: 'bg-danger' },
  { value: 'resource_restored', label: 'Resource restored', badge: 'bg-success' },
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
  const hasDiff = row.previous_details != null || row.new_details != null;
  const hasRemote = row.remote_response != null;
  if (!hasDiff && !hasRemote) {
    return (
      <p className="text-muted mb-0">{translate('No detail changes recorded for this event.')}</p>
    );
  }
  return (
    <div>
      {hasDiff && (
        <DetailsDiff
          before={row.previous_details}
          after={row.new_details}
          beforeLabel={translate('Previous')}
          afterLabel={translate('New')}
        />
      )}
      {hasRemote && (
        <div className={hasDiff ? 'mt-3' : undefined}>
          <div className="fw-semibold text-muted fs-8 text-uppercase mb-1">
            {translate('Remote response')}
          </div>
          {renderValue(row.remote_response)}
        </div>
      )}
    </div>
  );
};

const projectName = (row: any): string => {
  const details = parseDetails(row.new_details ?? row.previous_details);
  return (details.name as string) || '—';
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
    title: translate('Project'),
    render: ({ row }) => {
      const name = projectName(row);
      const uuid = (row as any).remote_project_uuid;
      if (uuid) {
        return (
          <Link
            state="organization-remote-project-detail"
            params={{ remoteProjectUuid: uuid }}
          >
            {name}
          </Link>
        );
      }
      return (
        <span className="d-inline-flex align-items-center gap-1">
          <span className="text-muted">{name !== '—' ? name : '—'}</span>
          <WarningCircleIcon
            size={14}
            className="text-warning flex-shrink-0"
            title={translate('Associated project has been deleted')}
          />
        </span>
      );
    },
    id: 'project',
    keys: ['new_details', 'previous_details'],
  },
  {
    title: translate('Performed by'),
    render: ({ row }) => row.performed_by_full_name || '—',
    id: 'performed_by',
    keys: ['performed_by_full_name'],
  },
  {
    title: translate('Note'),
    render: ({ row }) => row.note || <span className="text-muted">—</span>,
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

const INITIAL_FILTERS: Filters = {
  q: '',
  event_type: '',
  timestamp_after: '',
  timestamp_before: '',
  o: '-timestamp',
};

export const AllRemoteProjectsAuditLog = () => {
  const router = useRouter();
  useTitle(translate('Remote Projects Audit Log'), '', 'browser');

  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(filters.q), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters.q]);

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const filter = useMemo(() => ({
    o: filters.o,
    ...(debouncedQ ? { q: debouncedQ } : {}),
    ...(filters.event_type ? { event_type: filters.event_type } : {}),
    ...(filters.timestamp_after ? { timestamp_after: filters.timestamp_after } : {}),
    ...(filters.timestamp_before ? { timestamp_before: filters.timestamp_before } : {}),
  }), [filters, debouncedQ]);

  const tableProps = useTable({
    table: 'AllRemoteProjectsAuditLog',
    fetchData: createFetcher(openportalRemoteProjectAuditList),
    filter,
  });

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => router.stateService.go('organization-remote-projects')}
          title={translate('Back to Remote Projects')}
        >
          <ArrowLeftIcon size={16} />
        </Button>
        <h4 className="mb-0">{translate('Remote Projects — Audit Log')}</h4>
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
        <div className="col-md-2">
          <Form.Label className="fs-8 text-muted mb-1">{translate('From')}</Form.Label>
          <Form.Control
            size="sm"
            type="datetime-local"
            value={filters.timestamp_after}
            onChange={(e) =>
              setFilter('timestamp_after', e.target.value ? `${e.target.value}:00Z` : '')
            }
          />
        </div>
        <div className="col-md-2">
          <Form.Label className="fs-8 text-muted mb-1">{translate('To')}</Form.Label>
          <Form.Control
            size="sm"
            type="datetime-local"
            value={filters.timestamp_before}
            onChange={(e) =>
              setFilter('timestamp_before', e.target.value ? `${e.target.value}:00Z` : '')
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
            onClick={() => { setFilters(INITIAL_FILTERS); setDebouncedQ(''); }}
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
