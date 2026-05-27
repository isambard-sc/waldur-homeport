import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, Pagination } from 'react-bootstrap';
import { useRouter } from '@uirouter/react';
import { openportalRemoteProjectAuditList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { DetailsDiff, renderValue } from '../DetailsDiff';

const PAGE_SIZE = 20;

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

const AuditRow = ({ entry }: { entry: any }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDiff =
    entry.previous_details !== null ||
    entry.new_details !== null ||
    entry.remote_response !== null;

  return (
    <>
      <tr
        style={hasDiff ? { cursor: 'pointer' } : undefined}
        onClick={hasDiff ? () => setExpanded((e) => !e) : undefined}
      >
        <td className="text-nowrap">{formatDateTime(entry.timestamp)}</td>
        <td><EventBadge type={entry.event_type} /></td>
        <td>{entry.performed_by_full_name || '—'}</td>
        <td>{entry.note || <span className="text-muted">—</span>}</td>
        <td className="text-center" style={{ width: 32 }}>
          {hasDiff &&
            (expanded ? (
              <CaretDownIcon size={14} className="text-muted" />
            ) : (
              <CaretRightIcon size={14} className="text-muted" />
            ))}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="p-0">
            <div className="p-3 bg-light border-top">
              {(entry.previous_details !== null || entry.new_details !== null) && (
                <DetailsDiff
                  before={entry.previous_details}
                  after={entry.new_details}
                  beforeLabel={translate('Previous')}
                  afterLabel={translate('New')}
                />
              )}
              {entry.remote_response !== null && entry.remote_response !== undefined && (
                <div className="mt-3">
                  <div className="fw-semibold text-muted fs-8 text-uppercase mb-1">
                    {translate('Remote response')}
                  </div>
                  {renderValue(entry.remote_response)}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

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
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(filters.q), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters.q]);

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    if (key !== 'o') setPage(1);
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'remote-projects-audit-all',
      debouncedQ,
      filters.event_type,
      filters.timestamp_after,
      filters.timestamp_before,
      filters.o,
      page,
    ],
    queryFn: async () => {
      const result = await openportalRemoteProjectAuditList({
        query: {
          page,
          page_size: PAGE_SIZE,
          o: filters.o || undefined,
          ...(debouncedQ ? { q: debouncedQ } : {}),
          ...(filters.event_type ? { event_type: filters.event_type } : {}),
          ...(filters.timestamp_after ? { timestamp_after: filters.timestamp_after } : {}),
          ...(filters.timestamp_before ? { timestamp_before: filters.timestamp_before } : {}),
        },
      });
      return result.data;
    },
  });

  const entries: any[] = Array.isArray(data) ? data : (data as any)?.results ?? [];
  const count: number = Array.isArray(data) ? data.length : (data as any)?.count ?? 0;
  const totalPages = Math.ceil(count / PAGE_SIZE);

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
        {isFetching && <LoadingSpinnerIcon className="text-muted" />}
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
            onChange={(e) => setFilter('timestamp_after', e.target.value ? `${e.target.value}:00Z` : '')}
          />
        </div>
        <div className="col-md-2">
          <Form.Label className="fs-8 text-muted mb-1">{translate('To')}</Form.Label>
          <Form.Control
            size="sm"
            type="datetime-local"
            value={filters.timestamp_before}
            onChange={(e) => setFilter('timestamp_before', e.target.value ? `${e.target.value}:00Z` : '')}
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
            onClick={() => { setFilters(INITIAL_FILTERS); setDebouncedQ(''); setPage(1); }}
          >
            {translate('Reset')}
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center py-5 text-muted">
          <LoadingSpinnerIcon className="me-2" />
          {translate('Loading…')}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-muted py-4 text-center">{translate('No audit entries found.')}</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th>{translate('Timestamp')}</th>
                  <th>{translate('Event')}</th>
                  <th>{translate('Performed by')}</th>
                  <th>{translate('Note')}</th>
                  <th style={{ width: 32 }} />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <AuditRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted">
              {translate('Showing')} {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, count)} {translate('of')} {count}
            </small>
            {totalPages > 1 && (
              <Pagination size="sm" className="mb-0">
                <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | '…')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <Pagination.Ellipsis key={`e${i}`} disabled />
                    ) : (
                      <Pagination.Item
                        key={p}
                        active={p === page}
                        onClick={() => setPage(p as number)}
                      >
                        {p}
                      </Pagination.Item>
                    ),
                  )}
                <Pagination.Next disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} />
              </Pagination>
            )}
          </div>
        </>
      )}
    </div>
  );
};
