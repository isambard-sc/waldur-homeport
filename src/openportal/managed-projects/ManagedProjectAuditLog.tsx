import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { openportalManagedProjectAuditList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { DetailsDiff, renderValue } from '../DetailsDiff';

const EVENT_LABELS: Record<string, string> = {
  created: 'Created',
  approved: 'Approved',
  rejected: 'Rejected',
  deleted: 'Deleted',
  note_added: 'Note added',
  details_updated: 'Details updated',
  project_attached: 'Project attached',
  project_detached: 'Project detached',
};

const AuditRow = ({ entry }: { entry: any }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDiff =
    entry.previous_details !== null ||
    entry.new_details !== null;

  return (
    <>
      <tr
        className={hasDiff ? 'cursor-pointer' : undefined}
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
              {hasDiff ? (
                <DetailsDiff
                  before={entry.previous_details}
                  after={entry.new_details}
                  beforeLabel={translate('Previous')}
                  afterLabel={translate('New')}
                />
              ) : entry.note ? (
                <div className="fs-8">{renderValue(entry.note)}</div>
              ) : null}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const ManagedProjectAuditLog = () => {
  const { params } = useCurrentStateAndParams();
  const identifier = params.identifier as string;
  const destination = params.destination as string;
  const router = useRouter();

  useTitle(translate('Audit Log'), '', 'browser');

  const { data, isLoading } = useQuery({
    queryKey: ['managed-project-audit', identifier, destination],
    queryFn: async () => {
      const result = await openportalManagedProjectAuditList({
        query: {
          managed_project_identifier: identifier,
          managed_project_destination: destination,
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
