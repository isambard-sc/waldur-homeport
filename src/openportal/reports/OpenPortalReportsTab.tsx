/**
 * Debug/demo tab that fetches all cached OpenPortal usage and storage reports
 * for the current project and renders them using UsageReportVis / StorageReportVis.
 *
 * The raw JSON textarea at the bottom is editable — paste any valid
 * UsageReportApiItem[] / StorageReportApiItem[] JSON to drive the charts
 * without waiting for a live API response.
 */

import { useQuery } from '@tanstack/react-query';
import React, { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getProject } from '@waldur/workspace/selectors';

import { fetchUsageReports, fetchStorageReports } from './api';
import { ProjectUsageReport } from './ProjectUsageReport';
import { ProjectStorageReport } from './ProjectStorageReport';
import { StorageReportVis } from './StorageReportVis';
import { UsageReportVis } from './UsageReportVis';
import { StorageReportApiItem, UsageReportApiItem } from './types';

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

/** Try to parse textarea text as an array of API items and wrap them. */
function parseUsageJson(text: string): ProjectUsageReport[] | string {
  try {
    const items = JSON.parse(text) as UsageReportApiItem[];
    if (!Array.isArray(items)) return 'Expected a JSON array';
    return items.map(ProjectUsageReport.fromApiResponse);
  } catch (e) {
    return (e as Error).message;
  }
}

function parseStorageJson(text: string): ProjectStorageReport[] | string {
  try {
    const items = JSON.parse(text) as StorageReportApiItem[];
    if (!Array.isArray(items)) return 'Expected a JSON array';
    return items.map(ProjectStorageReport.fromApiResponse);
  } catch (e) {
    return (e as Error).message;
  }
}

/** Single editable JSON textarea with inline error display. */
const JsonEditor: FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}> = ({ label, value, onChange, error }) => (
  <div>
    <div className="d-flex align-items-center mb-1 gap-2">
      <span className="small fw-semibold">{label}</span>
      {error && <span className="text-danger small">{error}</span>}
    </div>
    <textarea
      className={`form-control form-control-sm font-monospace${error ? ' is-invalid' : ''}`}
      style={{ height: 200, resize: 'vertical', fontSize: '0.75rem' }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  </div>
);

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

  // Collect distinct resources across both report types
  const allResources = [
    ...new Set([
      ...(usageReports ?? []).map((r) => r.resource),
      ...(storageReports ?? []).map((r) => r.resource),
    ]),
  ].sort();

  const [selectedResource, setSelectedResource] = useState<string>('');
  // Resolve the active resource: use state if valid, otherwise fall back to first
  const activeResource =
    allResources.includes(selectedResource)
      ? selectedResource
      : (allResources[0] ?? '');

  // Filter by resource first, then group by month
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

  const apiUsage: ProjectUsageReport[] =
    activeMonth === 'all'
      ? usageForResource
      : (usageByMonth[activeMonth] ?? []);
  const apiStorage: ProjectStorageReport[] =
    activeMonth === 'all'
      ? storageForResource
      : (storageByMonth[activeMonth] ?? []);

  // Editable JSON state — seeded from API data, editable by the user
  const [usageText, setUsageText] = useState('[]');
  const [storageText, setStorageText] = useState('[]');

  // Sync textarea content whenever the API data or selected month changes
  useEffect(() => {
    setUsageText(
      apiUsage.length > 0
        ? JSON.stringify(apiUsage.map((r) => r.apiItem), null, 2)
        : '[]',
    );
  }, [activeMonth, activeResource, usageReports]);

  useEffect(() => {
    setStorageText(
      apiStorage.length > 0
        ? JSON.stringify(apiStorage.map((r) => r.apiItem), null, 2)
        : '[]',
    );
  }, [activeMonth, activeResource, storageReports]);

  // Parse the textarea text live
  const parsedUsage = parseUsageJson(usageText);
  const parsedStorage = parseStorageJson(storageText);

  const activeUsage = typeof parsedUsage !== 'string' ? parsedUsage : [];
  const activeStorage = typeof parsedStorage !== 'string' ? parsedStorage : [];
  const usageParseError = typeof parsedUsage === 'string' ? parsedUsage : null;
  const storageParseError = typeof parsedStorage === 'string' ? parsedStorage : null;

  const isLoading = usageLoading || storageLoading;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">OpenPortal Reports</h4>
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
                {r}
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

      {/* Editable JSON — paste custom data here to drive the charts */}
      <details className="mt-4" open={activeUsage.length === 0 && activeStorage.length === 0}>
        <summary className="text-muted small" style={{ cursor: 'pointer' }}>
          JSON data ({activeUsage.length} usage, {activeStorage.length} storage) — edit to override charts
        </summary>
        <p className="text-muted small mt-2 mb-2">
          These boxes are pre-populated with the API response. Edit or paste different JSON to drive the charts above without a live API call.
        </p>
        <div className="row mt-2 g-3">
          <div className="col-6">
            <JsonEditor
              label="Usage reports (UsageReportApiItem[])"
              value={usageText}
              onChange={setUsageText}
              error={usageParseError}
            />
          </div>
          <div className="col-6">
            <JsonEditor
              label="Storage reports (StorageReportApiItem[])"
              value={storageText}
              onChange={setStorageText}
              error={storageParseError}
            />
          </div>
        </div>
      </details>
    </div>
  );
};
