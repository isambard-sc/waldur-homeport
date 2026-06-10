import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { getFormValues } from 'redux-form';
import { openportalManagedProjectAuditList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

import { DetailsDiff } from '../DetailsDiff';
import {
  ManagedProjectAuditFilter,
  MANAGED_AUDIT_EVENT_OPTIONS,
} from './ManagedProjectAuditFilter';

const FORM_ID = 'ManagedProjectAuditLogFilter';

const EVENT_BADGE: Record<string, string> = Object.fromEntries(
  MANAGED_AUDIT_EVENT_OPTIONS.map((e) => [
    e.value,
    {
      created: 'bg-success',
      approved: 'bg-success',
      rejected: 'bg-danger',
      deleted: 'bg-danger',
      note_added: 'bg-info text-dark',
      details_updated: 'bg-warning text-dark',
      project_attached: 'bg-primary',
      project_detached: 'bg-warning text-dark',
    }[e.value] ?? 'bg-secondary',
  ]),
);

const EventBadge = ({ type }: { type: string }) => {
  const cls = EVENT_BADGE[type] ?? 'bg-secondary';
  const label =
    MANAGED_AUDIT_EVENT_OPTIONS.find((e) => e.value === type)?.label ?? type;
  return <span className={`badge ${cls} fw-normal`}>{label}</span>;
};

const ExpandedRow = ({ row }: { row: any }) => {
  const hasNote = !!row.note;
  const hasDiff = row.previous_details != null || row.new_details != null;
  if (!hasNote && !hasDiff) {
    return (
      <p className="text-muted mb-0">
        {translate('No detail changes recorded for this event.')}
      </p>
    );
  }
  return (
    <div>
      {hasNote && (
        <div className={hasDiff ? 'mb-3' : undefined}>
          <div className="fw-semibold text-muted fs-8 text-uppercase mb-1">
            {translate('Note')}
          </div>
          <p
            className="mb-0"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {row.note}
          </p>
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
    orderField: 'event_type',
    filter: 'event_type',
    id: 'event_type',
    keys: ['event_type'],
  },
  {
    title: translate('Performed by'),
    render: ({ row }) => row.performed_by_full_name || '—',
    id: 'performed_by',
    keys: ['performed_by_full_name'],
    optional: true,
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
              <Popover.Body
                className="fs-8"
                style={{
                  maxWidth: 360,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
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
    optional: true,
  },
];

export const ManagedProjectAuditLog = () => {
  const { params } = useCurrentStateAndParams();
  const identifier = params.identifier as string;
  const destination = params.destination as string;
  const router = useRouter();

  useTitle(translate('Audit Log'), '', 'browser');

  const filterValues: any = useSelector(getFormValues(FORM_ID));
  const filter = useMemo(
    () => ({
      managed_project_identifier: identifier,
      managed_project_destination: destination,
      ...(filterValues?.event_type?.value
        ? { event_type: filterValues.event_type.value }
        : {}),
      ...(filterValues?.date_range?.after
        ? { timestamp_after: filterValues.date_range.after }
        : {}),
      ...(filterValues?.date_range?.before
        ? { timestamp_before: filterValues.date_range.before }
        : {}),
    }),
    [identifier, destination, filterValues],
  );

  const tableProps = useTable({
    table: 'ManagedProjectAuditLog',
    fetchData: createFetcher(openportalManagedProjectAuditList),
    filter,
    queryField: 'q',
  });

  return (
    <div>
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
        <span className="text-muted fs-6">
          · {identifier} / {destination}
        </span>
      </div>

      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('audit entries')}
        showPageSizeSelector
        expandableRow={ExpandedRow}
        filters={<ManagedProjectAuditFilter form={FORM_ID} />}
        hasQuery
        initialSorting={{ field: 'timestamp', mode: 'desc' }}
        hasOptionalColumns
      />
    </div>
  );
};
