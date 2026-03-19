/**
 * Project-level OpenPortal usage report tab.
 *
 * Fetches usage and storage reports for the current project and renders them
 * using UsageReportVis / StorageReportVis.
 */

import { useQuery } from '@tanstack/react-query';
import React, { FC, useState } from 'react';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getProject } from '@waldur/workspace/selectors';

import {
  fetchUsageReports,
  fetchStorageReports,
  fetchOfferingMapping,
  fetchUserMapping,
} from './api';
import { ProjectUsageReport } from './ProjectUsageReport';
import { ProjectStorageReport } from './ProjectStorageReport';
import { StorageReportVis } from './StorageReportVis';
import { NameMaps } from './usageChartOptions';
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
    refetchOnWindowFocus: false,
    staleTime: Infinity,
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
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const hasReports = !!(usageReports || storageReports);

  // ── Fetch name mappings once reports are available ───────────────────────
  const { data: nameMaps } = useQuery<NameMaps>({
    queryKey: ['openportal-project-mappings', project?.uuid],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    queryFn: async () => {
      const usage = usageReports ?? [];
      const storage = storageReports ?? [];
      const offeringIds = [...new Set<string>([
        ...usage.map((r) => r.resource),
        ...storage.map((r) => r.resource),
      ])];
      const userIds = [...new Set<string>(
        usage.flatMap((r) => Object.keys(r.users)),
      )];
      const offerings = await fetchOfferingMapping(offeringIds);
      const users = await fetchUserMapping(userIds);
      return {
        offering: Object.fromEntries(Object.entries(offerings).map(([k, v]) => [k, v.name])),
        user: Object.fromEntries(Object.entries(users).map(([k, v]) => [k, v.full_name])),
      } as NameMaps;
    },
    enabled: hasReports,
  });

  // Collect distinct resources across both report types
  const allResources = [
    ...new Set([
      ...(usageReports ?? []).map((r) => r.resource),
      ...(storageReports ?? []).map((r) => r.resource),
    ]),
  ].sort();

  const [selectedResource, setSelectedResource] = useState<string>('');
  const activeResource =
    allResources.includes(selectedResource)
      ? selectedResource
      : (allResources[0] ?? '');

  const usageForResource = (usageReports ?? []).filter(
    (r) => r.resource === activeResource,
  );
  const storageForResource = (storageReports ?? []).filter(
    (r) => r.resource === activeResource,
  );

  const usageByMonth = groupByMonth(usageForResource);
  const storageByMonth = groupByMonth(storageForResource);
  const allMonths = [
    ...new Set([...Object.keys(usageByMonth), ...Object.keys(storageByMonth)]),
  ].sort().reverse();

  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const activeMonth = selectedMonth;

  const activeUsage: ProjectUsageReport[] =
    activeMonth === 'all'
      ? usageForResource
      : (usageByMonth[activeMonth] ?? []);
  const activeStorage: ProjectStorageReport[] =
    activeMonth === 'all'
      ? storageForResource
      : (storageByMonth[activeMonth] ?? []);

  const isLoading = usageLoading || storageLoading;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">Usage Report</h4>
        {/* Resource / destination picker */}
        {allResources.length > 1 && (
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={activeResource}
            onChange={(e) => {
              setSelectedResource(e.target.value);
              setSelectedMonth('all');
            }}
          >
            {allResources.map((r) => (
              <option key={r} value={r}>
                {nameMaps?.offering?.[r] ?? r}
              </option>
            ))}
          </select>
        )}

        {/* Month picker */}
        {allMonths.length > 0 && (
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={activeMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">All time</option>
            {allMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          className="btn btn-secondary btn-sm ms-auto"
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
      {activeUsage.length > 0 && nameMaps !== undefined && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Usage</div>
          <div className="card-body">
            <UsageReportVis reports={activeUsage} height="400px" nameMaps={nameMaps} />
          </div>
        </div>
      )}

      {/* Storage chart */}
      {activeStorage.length > 0 && nameMaps !== undefined && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Storage</div>
          <div className="card-body">
            <StorageReportVis reports={activeStorage} height="360px" nameMaps={nameMaps} />
          </div>
        </div>
      )}
    </div>
  );
};
