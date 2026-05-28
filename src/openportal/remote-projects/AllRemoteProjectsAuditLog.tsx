import { ArrowLeftIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useRouter } from '@uirouter/react';
import { getFormValues } from 'redux-form';
import { openportalRemoteProjectAuditList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

import { DetailsDiff, renderValue, parseDetails } from '../DetailsDiff';
import {
  RemoteProjectAuditFilter,
  REMOTE_AUDIT_EVENT_OPTIONS,
} from './RemoteProjectAuditFilter';

const FORM_ID = 'AllRemoteProjectsAuditLogFilter';

const EVENT_BADGE: Record<string, string> = Object.fromEntries(
  REMOTE_AUDIT_EVENT_OPTIONS.map((e) => [
    e.value,
    {
      award_attempted: 'bg-primary',
      award_rejected: 'bg-danger',
      award_created: 'bg-success',
      award_updated: 'bg-warning text-dark',
      award_update_confirmed: 'bg-success',
      award_update_rejected: 'bg-danger',
      state_changed: 'bg-info text-dark',
      resource_deleted: 'bg-danger',
    }[e.value] ?? 'bg-secondary',
  ]),
);

const EventBadge = ({ type }: { type: string }) => {
  const cls = EVENT_BADGE[type] ?? 'bg-secondary';
  const label =
    REMOTE_AUDIT_EVENT_OPTIONS.find((e) => e.value === type)?.label ?? type;
  return <span className={`badge ${cls} fw-normal`}>{label}</span>;
};

const ExpandedRow = ({ row }: { row: any }) => {
  const hasNote = !!row.note;
  const hasDiff = row.previous_details != null || row.new_details != null;
  const hasRemote = row.remote_response != null;
  if (!hasNote && !hasDiff && !hasRemote) {
    return (
      <p className="text-muted mb-0">
        {translate('No detail changes recorded for this event.')}
      </p>
    );
  }
  return (
    <div>
      {hasNote && (
        <div className={hasDiff || hasRemote ? 'mb-3' : undefined}>
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
      {hasRemote && (
        <div className={hasDiff || hasNote ? 'mt-3' : undefined}>
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
    orderField: 'event_type',
    filter: 'event_type',
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

export const AllRemoteProjectsAuditLog = () => {
  const router = useRouter();
  useTitle(translate('Remote Projects Audit Log'), '', 'browser');

  const filterValues: any = useSelector(getFormValues(FORM_ID));
  const filter = useMemo(
    () => ({
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
    [filterValues],
  );

  const tableProps = useTable({
    table: 'AllRemoteProjectsAuditLog',
    fetchData: createFetcher(openportalRemoteProjectAuditList),
    filter,
    queryField: 'q',
  });

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() =>
            router.stateService.go('organization-remote-projects')
          }
          title={translate('Back to Remote Projects')}
        >
          <ArrowLeftIcon size={16} />
        </button>
        <h4 className="mb-0">{translate('Remote Projects — Audit Log')}</h4>
      </div>

      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('audit entries')}
        showPageSizeSelector
        expandableRow={ExpandedRow}
        filters={<RemoteProjectAuditFilter form={FORM_ID} />}
        hasQuery
        initialSorting={{ field: 'timestamp', mode: 'desc' }}
        hasOptionalColumns
      />
    </div>
  );
};
