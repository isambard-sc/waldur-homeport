/**
 * Debug/demo tab that fetches all cached OpenPortal usage and storage reports
 * for the current project and renders them using UsageReportVis / StorageReportVis.
 *
 * This is intentionally rough — it is wired up under the project dashboard
 * just for development / QA purposes.
 */

import { useQuery } from '@tanstack/react-query';
import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getProject } from '@waldur/workspace/selectors';

import { fetchUsageReports, fetchStorageReports } from './api';
import { ProjectUsageReport } from './ProjectUsageReport';
import { ProjectStorageReport } from './ProjectStorageReport';
import { StorageReportVis } from './StorageReportVis';
import { UsageReportVis } from './UsageReportVis';

/** Group reports by "year-month" so the user can select a specific month */
const groupByMonth = <T extends { year: number; month: number }>(
  items: T[],
): Record<string, T[]> => {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    groups[key] = [...(groups[key] ?? []), item];
  }
  return groups;
};

export const OpenPortalReportsTab: FC = () => {
  const project = useSelector(getProject);

  const {
    data: usageReports,
    isLoading: usageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ['openportal-usage-reports', project?.uuid],
    queryFn: () =>
      fetchUsageReports({ project_uuid: project?.uuid }),
    enabled: !!project,
  });

  const {
    data: storageReports,
    isLoading: storageLoading,
    error: storageError,
    refetch: refetchStorage,
  } = useQuery({
    queryKey: ['openportal-storage-reports', project?.uuid],
    queryFn: () =>
      fetchStorageReports({ project_uuid: project?.uuid }),
    enabled: !!project,
  });

  const usageByMonth = usageReports ? groupByMonth(usageReports) : {};
  const storageByMonth = storageReports ? groupByMonth(storageReports) : {};
  const allMonths = [
    ...new Set([...Object.keys(usageByMonth), ...Object.keys(storageByMonth)]),
  ].sort().reverse();

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const activeMonth = selectedMonth || allMonths[0] || '';

  const activeUsage: ProjectUsageReport[] = usageByMonth[activeMonth] ?? [];
  const activeStorage: ProjectStorageReport[] = storageByMonth[activeMonth] ?? [];

  const isLoading = usageLoading || storageLoading;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">OpenPortal Reports</h4>
        {/* Month picker */}
        {allMonths.length > 1 && (
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={activeMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {allMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm ms-auto"
          onClick={() => { refetchUsage(); refetchStorage(); }}
        >
          Refresh
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {usageError && (
        <LoadingErred
          message="Failed to load usage reports"
          loadData={refetchUsage}
        />
      )}

      {storageError && (
        <LoadingErred
          message="Failed to load storage reports"
          loadData={refetchStorage}
        />
      )}

      {!isLoading && !usageError && !storageError && allMonths.length === 0 && (
        <p className="text-muted">
          No OpenPortal reports found for this project.
        </p>
      )}

      {/* Usage chart */}
      {activeUsage.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Usage</div>
          <div className="card-body">
            <UsageReportVis reports={activeUsage} height="400px" />
          </div>
        </div>
      )}

      {/* Storage chart */}
      {activeStorage.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Storage</div>
          <div className="card-body">
            <StorageReportVis reports={activeStorage} height="360px" />
          </div>
        </div>
      )}

      {/* Raw data dump for debugging */}
      <details className="mt-4">
        <summary className="text-muted small" style={{ cursor: 'pointer' }}>
          Raw API response ({activeUsage.length} usage, {activeStorage.length} storage)
        </summary>
        <div className="row mt-2">
          {activeUsage.length > 0 && (
            <div className="col-6">
              <pre
                className="bg-light p-2 rounded small"
                style={{ maxHeight: 300, overflow: 'auto' }}
              >
                {JSON.stringify(
                  activeUsage.map((r) => r.apiItem),
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
          {activeStorage.length > 0 && (
            <div className="col-6">
              <pre
                className="bg-light p-2 rounded small"
                style={{ maxHeight: 300, overflow: 'auto' }}
              >
                {JSON.stringify(
                  activeStorage.map((r) => r.apiItem),
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
        </div>
      </details>
    </div>
  );
};
