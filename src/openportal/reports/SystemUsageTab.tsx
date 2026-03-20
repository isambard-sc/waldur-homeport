/**
 * System-wide OpenPortal usage and storage tab for staff / support users.
 */

import { useQuery } from '@tanstack/react-query';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';

import {
  fetchUsageReports,
  fetchStorageReports,
  fetchOfferingMapping,
  fetchProjectMapping,
  fetchUserMapping,
  mappingBatchCount,
} from './api';
import {
  clearMappingCache,
} from './localStorageCache';
import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import { StageProgress } from './StageProgress';
import { StorageReportVis } from './StorageReportVis';
import { NameMaps } from './usageChartOptions';
import { UsageReportVis } from './UsageReportVis';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_USER_MAPPINGS = 100;

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
  const [showLoadPrompt, setShowLoadPrompt] = useState(true);
  const [loadAllUserMappings, setLoadAllUserMappings] = useState(false);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // ── Pre-filter: year / month ─────────────────────────────────────────────
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);

  // ── Stage 2: Fetch all reports system-wide ──────────────────────────────
  // (No project list for system tab — reports fetched directly)
  const [usageProgress, setUsageProgress] = useState({ page: 0, total: 0 });
  const [storageProgress, setStorageProgress] = useState({ page: 0, total: 0 });
  // 'idle' | 'usage' | 'storage' | 'done'
  const [fetchPhase, setFetchPhase] = useState<'idle' | 'usage' | 'storage' | 'done'>('idle');

  const {
    data: reportData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['openportal-system-reports', filterYear, filterMonth],
    queryFn: async () => {
      setUsageProgress({ page: 0, total: 0 });
      setStorageProgress({ page: 0, total: 0 });
      setFetchPhase('usage');
      const usage = await fetchUsageReports(
        { year: filterYear, month: filterMonth },
        (page, totalPages) => setUsageProgress({ page, total: totalPages ?? 0 }),
      );
      setFetchPhase('storage');
      const storage = await fetchStorageReports(
        { year: filterYear, month: filterMonth },
        (page, totalPages) => setStorageProgress({ page, total: totalPages ?? 0 }),
      );
      setFetchPhase('done');
      return { usage, storage };
    },
    enabled: loadTriggered,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const allUsage = reportData?.usage ?? [];
  const allStorage = reportData?.storage ?? [];

  // ── Stage 4: Fetch name mappings ─────────────────────────────────────────
  const [mappingsProgress, setMappingsProgress] = useState({ done: 0, total: 0, statusMsg: '' });
  const [mapsResult, setMapsResult] = useState<{ maps: NameMaps; truncatedUserCount: number } | undefined>(undefined);
  const [mappingsLoading, setMappingsLoading] = useState(false);

  useEffect(() => {
    if (!reportData) {
      setMapsResult(undefined);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setMapsResult(undefined);
      setMappingsLoading(true);
      setMappingsProgress({ done: 0, total: 0, statusMsg: '' });
      try {
        const usageReports = reportData.usage;
        const storageReports = reportData.storage;
        const offeringIds = [
          ...new Set<string>([
            ...usageReports.map((r) => r.resource),
            ...storageReports.map((r) => r.resource),
          ]),
        ];
        const projectIds = [
          ...new Set<string>([
            ...usageReports.map((r) => r.project),
            ...storageReports.map((r) => r.project),
          ]),
        ];
        const allUserIds = [...new Set<string>(usageReports.flatMap((r) => Object.keys(r.users)))];
        const usageByUid: Record<string, number> = {};
        for (const r of usageReports) {
          for (const [uid, localName] of Object.entries(r.users)) {
            let sec = 0;
            for (const date of r.dates) {
              sec += r.getReport(date)?.usageForUser(localName)?.seconds ?? 0;
            }
            usageByUid[uid] = (usageByUid[uid] ?? 0) + sec;
          }
        }
        const usersWithUsage = allUserIds
          .filter((uid) => (usageByUid[uid] ?? 0) > 0)
          .sort((a, b) => (usageByUid[b] ?? 0) - (usageByUid[a] ?? 0));
        const userIds = loadAllUserMappings
          ? usersWithUsage
          : usersWithUsage.slice(0, MAX_USER_MAPPINGS);
        const truncatedUserCount = !loadAllUserMappings && usersWithUsage.length > MAX_USER_MAPPINGS
          ? usersWithUsage.length - MAX_USER_MAPPINGS
          : 0;

        const ob = mappingBatchCount(offeringIds);
        const pb = mappingBatchCount(projectIds);
        const ub = mappingBatchCount(userIds);
        const total = ob + pb + ub;

        console.debug('[OpenPortal system] mappings start:', { offerings: offeringIds.length, projects: projectIds.length, users: userIds.length, total });
        setMappingsProgress({ done: 0, total, statusMsg: 'Offering names…' });

        const offerings = await fetchOfferingMapping(offeringIds, (done) => {
          if (cancelled) return;
          setMappingsProgress({ done, total, statusMsg: `Offering names — ${done} of ${ob}` });
        });
        if (cancelled) return;
        setMappingsProgress({ done: ob, total, statusMsg: 'Project names…' });

        const projMaps = await fetchProjectMapping(projectIds, (done) => {
          if (cancelled) return;
          setMappingsProgress({ done: ob + done, total, statusMsg: `Project names — ${done} of ${pb}` });
        });
        if (cancelled) return;
        setMappingsProgress({ done: ob + pb, total, statusMsg: 'User names…' });

        const users = await fetchUserMapping(userIds, (done) => {
          if (cancelled) return;
          setMappingsProgress({ done: ob + pb + done, total, statusMsg: `User names — ${done} of ${ub}` });
        });
        if (cancelled) return;

        console.debug('[OpenPortal system] mappings done:', { offerings: Object.keys(offerings).length, projects: Object.keys(projMaps).length, users: Object.keys(users).length });

        const maps = {
          offering: Object.fromEntries(Object.entries(offerings).map(([k, v]) => [k, v.name])),
          project: Object.fromEntries(Object.entries(projMaps).map(([k, v]) => [k, v.name])),
          user: Object.fromEntries(Object.entries(users).map(([k, v]) => [k, v.full_name])),
        } as NameMaps;
        setMapsResult({ maps, truncatedUserCount });
      } catch (err) {
        console.error('[OpenPortal system] mapping error:', err);
      } finally {
        if (!cancelled) setMappingsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [reportData, loadAllUserMappings]); // eslint-disable-line react-hooks/exhaustive-deps

  const nameMaps = mapsResult?.maps;
  const usersTruncatedCount = mapsResult?.truncatedUserCount ?? 0;

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
  const loadingStage = reportsLoading ? 2 : mappingsLoading ? 4 : 0;

  // ── Slow-load warning ────────────────────────────────────────────────────
  useEffect(() => {
    const isLoading = reportsLoading || loadingStage === 4;
    if (!isLoading) {
      setShowSlowWarning(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowWarning(true), 5000);
    return () => clearTimeout(timer);
  }, [reportsLoading, loadingStage]);

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

        <div className="ms-auto d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              clearMappingCache();
              refetchReports();
            }}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => { setShowLoadPrompt(true); setLoadTriggered(false); }}
          >
            Load new data…
          </button>
        </div>
      </div>

      {/* ── Load prompt ─────────────────────────────────────────────────── */}
      {showLoadPrompt && !loadTriggered && (
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
              onClick={() => { setLoadTriggered(true); setShowLoadPrompt(false); }}
            >
              Load reports
            </button>
          </div>
        </div>
      )}

      {/* ── Progress bars ───────────────────────────────────────────────── */}
      {loadingStage === 2 && fetchPhase === 'usage' && (
        <StageProgress
          stage={2}
          total={4}
          label="Downloading usage reports"
          done={usageProgress.page}
          max={usageProgress.total}
          statusMsg={
            usageProgress.total
              ? `Page ${usageProgress.page} of ${usageProgress.total}`
              : usageProgress.page > 0
                ? `Page ${usageProgress.page}…`
                : undefined
          }
        />
      )}
      {loadingStage === 2 && fetchPhase === 'storage' && (
        <StageProgress
          stage={3}
          total={4}
          label="Downloading storage reports"
          done={storageProgress.page}
          max={storageProgress.total}
          statusMsg={
            storageProgress.total
              ? `Page ${storageProgress.page} of ${storageProgress.total}`
              : storageProgress.page > 0
                ? `Page ${storageProgress.page}…`
                : undefined
          }
        />
      )}
      {loadingStage === 4 && (
        <StageProgress
          stage={4}
          total={4}
          label="Loading name mappings"
          done={mappingsProgress.done}
          max={mappingsProgress.total}
          statusMsg={mappingsProgress.statusMsg || undefined}
        />
      )}

      {/* ── Slow-load warning ───────────────────────────────────────────── */}
      {showSlowWarning && (
        <div className="alert alert-warning d-flex align-items-start gap-3 mb-3">
          <div className="flex-grow-1">
            <strong>This is taking a while.</strong>
            <div className="small mt-1">
              To speed things up: select a specific year and month filter before loading.
              System-wide data across all projects and users can be very large.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-warning btn-sm flex-shrink-0"
            onClick={() => window.location.reload()}
          >
            Cancel &amp; reload
          </button>
        </div>
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

      {/* ── User mapping truncation notice ──────────────────────────────── */}
      {usersTruncatedCount > 0 && nameMaps !== undefined && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3 py-2">
          <small>
            User names shown for top {MAX_USER_MAPPINGS} users by usage only.{' '}
            {usersTruncatedCount} more user{usersTruncatedCount !== 1 ? 's' : ''} not mapped.
          </small>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary ms-auto"
            onClick={() => setLoadAllUserMappings(true)}
          >
            Load all user names
          </button>
        </div>
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
