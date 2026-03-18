/**
 * System-wide OpenPortal usage and storage tab for staff / support users.
 *
 * Fetches every OpenPortal usage and storage report in the system (no customer
 * or project filter) and presents them through the same UsageReportVis /
 * StorageReportVis components used by the per-organisation view.
 *
 * Controls:
 *   - Resource dropdown  — filter by HPC destination
 *   - Month dropdown     — "All time" or a specific YYYY-MM
 *   - Lazy load prompt   — data is only fetched when the user clicks "Load"
 *
 * Visible to staff and support users only (via route permissions).
 */

import { useQuery } from '@tanstack/react-query';
import React, { FC, useMemo, useState } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import {
  fetchUsageReports,
  fetchStorageReports,
  fetchOfferingMapping,
  fetchProjectMapping,
  fetchUserMapping,
} from './api';
import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import { StorageReportVis } from './StorageReportVis';
import { NameMaps } from './usageChartOptions';
import { UsageReportVis } from './UsageReportVis';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Main tab ──────────────────────────────────────────────────────────────────

export const SystemUsageTab: FC = () => {
  // ── Lazy load ───────────────────────────────────────────────────────────
  const [loadTriggered, setLoadTriggered] = useState(false);

  // ── Fetch all reports system-wide ───────────────────────────────────────
  const {
    data: reportData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['openportal-system-reports'],
    queryFn: () =>
      Promise.all([fetchUsageReports(), fetchStorageReports()]).then(
        ([usage, storage]) => ({ usage, storage }),
      ),
    enabled: loadTriggered,
  });

  const allUsage = reportData?.usage ?? [];
  const allStorage = reportData?.storage ?? [];

  // ── Fetch human-readable name mappings ──────────────────────────────────
  const { data: nameMaps } = useQuery<NameMaps>({
    queryKey: ['openportal-system-mappings'],
    queryFn: async () => {
      const offeringIds = [...new Set<string>([
        ...allUsage.map((r) => r.resource),
        ...allStorage.map((r) => r.resource),
      ])];
      const projectIds = [...new Set<string>([
        ...allUsage.map((r) => r.project),
        ...allStorage.map((r) => r.project),
      ])];
      const userIds = [...new Set<string>(
        allUsage.flatMap((r) => Object.keys(r.users)),
      )];
      const [offerings, projects, users] = await Promise.all([
        fetchOfferingMapping(offeringIds),
        fetchProjectMapping(projectIds),
        fetchUserMapping(userIds),
      ]);
      return {
        offering: Object.fromEntries(Object.entries(offerings).map(([k, v]) => [k, v.name])),
        project: Object.fromEntries(Object.entries(projects).map(([k, v]) => [k, v.name])),
        user: Object.fromEntries(Object.entries(users).map(([k, v]) => [k, v.full_name])),
      } as NameMaps;
    },
    enabled: !!reportData,
  });

  // ── Resource filter ─────────────────────────────────────────────────────
  const allResources = useMemo(
    () =>
      [
        ...new Set([
          ...allUsage.map((r) => r.resource),
          ...allStorage.map((r) => r.resource),
        ]),
      ].sort(),
    [allUsage, allStorage],
  );

  const [selectedResource, setSelectedResource] = useState('');
  const activeResource = allResources.includes(selectedResource)
    ? selectedResource
    : (allResources[0] ?? '');

  const usageForResource = allUsage.filter((r) => r.resource === activeResource);
  const storageForResource = allStorage.filter(
    (r) => r.resource === activeResource,
  );

  // ── Month filter ────────────────────────────────────────────────────────
  const usageByMonth = groupByMonth(usageForResource);
  const storageByMonth = groupByMonth(storageForResource);
  const allMonths = [
    ...new Set([
      ...Object.keys(usageByMonth),
      ...Object.keys(storageByMonth),
    ]),
  ]
    .sort()
    .reverse();

  const [selectedMonth, setSelectedMonth] = useState('all');

  const activeUsage: ProjectUsageReport[] =
    selectedMonth === 'all'
      ? usageForResource
      : (usageByMonth[selectedMonth] ?? []);
  const activeStorage: ProjectStorageReport[] =
    selectedMonth === 'all'
      ? storageForResource
      : (storageByMonth[selectedMonth] ?? []);

  return (
    <div className="container-fluid py-4">
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <h4 className="mb-0">System Usage Report</h4>

        {/* Resource picker */}
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
            value={selectedMonth}
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
          onClick={() => {
            if (loadTriggered) refetchReports();
          }}
        >
          Refresh
        </button>
      </div>

      {/* ── Load prompt ─────────────────────────────────────────────────── */}
      {!loadTriggered && !reportData && (
        <div className="card mb-4">
          <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div>
              <p className="mb-1 fw-semibold">System usage data not yet loaded</p>
              <p className="mb-0 text-muted small">
                Loading fetches all OpenPortal usage and storage reports across
                every project in the system. This may take 10–15 seconds.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm ms-auto"
              onClick={() => setLoadTriggered(true)}
            >
              Load reports
            </button>
          </div>
        </div>
      )}

      {/* ── Status ─────────────────────────────────────────────────────── */}
      {reportsLoading && <LoadingSpinner />}

      {reportsError && (
        <LoadingErred
          message="Failed to load system usage reports"
          loadData={refetchReports}
        />
      )}

      {loadTriggered &&
        !reportsLoading &&
        !reportsError &&
        allUsage.length === 0 &&
        allStorage.length === 0 && (
          <p className="text-muted">No OpenPortal reports found.</p>
        )}

      {/* ── Usage chart ──────────────────────────────────────────────── */}
      {activeUsage.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Usage</div>
          <div className="card-body">
            <UsageReportVis reports={activeUsage} height="400px" nameMaps={nameMaps} />
          </div>
        </div>
      )}

      {/* ── Storage chart ────────────────────────────────────────────── */}
      {activeStorage.length > 0 && (
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
