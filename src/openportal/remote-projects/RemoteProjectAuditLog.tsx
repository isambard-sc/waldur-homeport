import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { openportalRemoteProjectAuditList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { DetailsDiff, renderValue } from '../DetailsDiff';

const EVENT_LABELS: Record<string, string> = {
  award_attempted: 'Award attempted',
  award_rejected: 'Award rejected',
  award_created: 'Award created',
  award_confirmed: 'Award confirmed',
  award_updated: 'Award updated',
  award_update_confirmed: 'Award update confirmed',
  award_update_rejected: 'Award update rejected',
  award_fetched: 'Award fetched',
  allocation_changed: 'Allocation changed',
  allocation_confirmed: 'Allocation confirmed',
  allocation_rejected: 'Allocation rejected',
  project_attached: 'Project attached',
  project_detached: 'Project detached',
  state_changed: 'State changed',
  resource_deleted: 'Resource deleted',
  resource_restored: 'Resource restored',
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
        <td>
          <span className="badge bg-secondary fw-normal">
            {EVENT_LABELS[entry.event_type] ?? entry.event_type}
          </span>
        </td>
        <td>{entry.performed_by_full_name || '—'}</td>
        <td>{entry.note || <span className="text-muted">—</span>}</td>
        <td className="text-center">
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

export const RemoteProjectAuditLog = () => {
  const { params } = useCurrentStateAndParams();
  const uuid = params.remoteProjectUuid as string;
  const router = useRouter();

  useTitle(translate('Audit Log'), '', 'browser');

  const { data, isLoading } = useQuery({
    queryKey: ['remote-project-audit', uuid],
    queryFn: async () => {
      const result = await openportalRemoteProjectAuditList({
        query: {
          remote_project_uuid: uuid,
          page_size: 200,
          o: '-timestamp',
        },
      });
      return result.data;
    },
  });

  const entries: any[] = Array.isArray(data) ? data : (data as any)?.results ?? [];

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() =>
            router.stateService.go('organization-remote-project-detail', {
              remoteProjectUuid: uuid,
            })
          }
          title={translate('Back to Remote Project')}
        >
          <ArrowLeftIcon size={16} />
        </Button>
        <h4 className="mb-0">{translate('Audit Log')}</h4>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center py-5 text-muted">
          <LoadingSpinnerIcon className="me-2" />
          {translate('Loading...')}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-muted py-4 text-center">{translate('No audit entries found.')}</div>
      ) : (
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
      )}
    </div>
  );
};
