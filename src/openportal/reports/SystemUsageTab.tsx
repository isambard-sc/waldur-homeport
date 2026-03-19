/**
 * System-wide OpenPortal usage and storage tab for staff / support users.
 */

import { useQuery } from '@tanstack/react-query';
import React, { FC, useMemo, useState } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';

import {
  fetchUsageReports,
  fetchStorageReports,
  fetchOfferingMapping,
  fetchProjectMapping,
  fetchUserMapping,
} from './api';
import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import { StageProgress } from './StageProgress';
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

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 2024 + 1 },
  (_, i) => 2024 + i,
);
const MONTH_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Main tab ──────────────────────────────────────────────────────────────────

export const SystemUsageTab: FC = () => {
  const [loadTriggered, setLoadTriggered] = useState(false);

  // ── Pre-filter: year / month ─────────────────────────────────────────────
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);

  // ── Stage 1 & 2 combined: Fetch all reports system-wide ─────────────────
  // (No project list needed for system tab — reports fetched directly)
  const {
    data: reportData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['openportal-system-reports', filterYear, filterMonth],
    queryFn: () =>
      Promise.all([
        fetchUsageReports({ year: filterYear, month: filterMonth }),
        fetchStorageReports({ year: filterYear, month: filterMonth }),
      ]).then(([usage, storage]) => ({ usage, storage })),
    enabled: loadTriggered,
  });

  const allUsage = reportData?.usage ?? [];
  const allStorage = reportData?.storage ?? [];

  // ── Stage 3: Fetch name mappings ─────────────────────────────────────────
  const [mappingsLoading, setMappingsLoading] = useState(false);

  const { data: nameMaps } = useQuery<NameMaps>({
    queryKey: ['openportal-system-mappings', filterYear, filterMonth],
    queryFn: async () => {
      setMappingsLoading(true);
      try {
        const offeringIds = [
          ...new Set<string>([
            ...allUsage.map((r) => r.resource),
            ...allStorage.map((r) => r.resource),
          ]),
        ];
        const projectIds = [
          ...new Set<string>([
            ...allUsage.map((r) => r.project),
            ...allStorage.map((r) => r.project),
          ]),
        ];
        const userIds = [
          ...new Set<string>(allUsage.flatMap((r) => Object.keys(r.users))),
        ];
        const [offerings, projMaps, users] = await Promise.all([
          fetchOfferingMapping(offeringIds),
          fetchProjectMapping(projectIds),
          fetchUserMapping(userIds),
        ]);
        return {
          offering: Object.fromEntries(
            Object.entries(offerings).map(([k, v]) => [k, v.name]),
          ),
          project: Object.fromEntries(
            Object.entries(projMaps).map(([k, v]) => [k, v.name]),
          ),
          user: Object.fromEntries(
            Object.entries(users).map(([k, v]) => [k, v.full_name]),
          ),
        } as NameMaps;
      } finally {
        setMappingsLoading(false);
      }
    },
    enabled: !!reportData,
  });

  // ── Resource filter ──────────────────────────────────────────────────────
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
  const storageForResource = allStorage.filter((r) => r.resource === activeResource);

  // ── Month filter ─────────────────────────────────────────────────────────
  const usageByMonth = groupByMonth(usageForResource);
  const storageByMonth = groupByMonth(storageForResource);
  const allMonths = [
    ...new Set([...Object.keys(usageByMonth), ...Object.keys(storageByMonth)]),
  ]
    .sort()
    .reverse();

  const [selectedMonth, setSelectedMonth] = useState('all');

  const activeUsage: ProjectUsageReport[] =
    selectedMonth === 'all' ? usageForResource : (usageByMonth[selectedMonth] ?? []);
  const activeStorage: ProjectStorageReport[] =
    selectedMonth === 'all' ? storageForResource : (storageByMonth[selectedMonth] ?? []);

  // ── Current loading stage ────────────────────────────────────────────────
  const loadingStage = reportsLoading ? 2 : mappingsLoading ? 3 : 0;

  return (
    <div className="container-fluid py-4">
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <h4 className="mb-0">System Usage Report</h4>

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
          <div className="card-body">
            <p className="mb-2 fw-semibold">System usage data not yet loaded</p>

            {/* Year / Month pre-filters */}
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div>
                <label className="form-label small mb-1">Year</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={filterYear ?? ''}
                  onChange={(e) =>
                    setFilterYear(e.target.value ? Number(e.target.value) : undefined)
                  }
                >
                  <option value="">All years</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label small mb-1">Month</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={filterMonth ?? ''}
                  onChange={(e) =>
                    setFilterMonth(e.target.value ? Number(e.target.value) : undefined)
                  }
                >
                  <option value="">All months</option>
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {MONTH_NAMES[m - 1]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-muted small mb-3">
              Fetches all OpenPortal usage and storage reports across every project in the system.
              Filtering to a specific year or month will be much faster.
            </p>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setLoadTriggered(true)}
            >
              Load reports
            </button>
          </div>
        </div>
      )}

      {/* ── Progress bars ───────────────────────────────────────────────── */}
      {loadingStage === 2 && (
        <StageProgress
          stage={2}
          total={3}
          label="Loading reports"
          done={0}
          max={0}
        />
      )}
      {loadingStage === 3 && (
        <StageProgress
          stage={3}
          total={3}
          label="Loading name mappings"
          done={0}
          max={0}
        />
      )}

      {/* ── Errors ─────────────────────────────────────────────────────── */}
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

      {/* ── Charts ────────────────────────────────────────────────────── */}
      {activeUsage.length > 0 && nameMaps !== undefined && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Usage</div>
          <div className="card-body">
            <UsageReportVis reports={activeUsage} height="400px" nameMaps={nameMaps} />
          </div>
        </div>
      )}

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
