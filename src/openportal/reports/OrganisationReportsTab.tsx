/**
 * Organisation-level OpenPortal reports tab.
 */

import { useQuery } from '@tanstack/react-query';
import { Project, projectsList } from 'waldur-js-client';

import { getNextPageUrl } from '@waldur/core/api';
import React, { FC, useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  fetchUsageReports,
  fetchStorageReports,
  fetchOfferingMapping,
  fetchProjectMapping,
  fetchUserMapping,
  mappingBatchCount,
} from './api';
import {
  getCached,
  setCached,
  clearCached,
  clearMappingCache,
  getCacheAge,
  formatCacheAge,
  TTL,
} from './localStorageCache';
import { StageProgress } from './StageProgress';
import { NameMaps } from './usageChartOptions';
import { ProjectUsageReport } from './ProjectUsageReport';
import { ProjectStorageReport } from './ProjectStorageReport';
import { StorageReportVis } from './StorageReportVis';
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
const MAX_USER_MAPPINGS = 100;

// ── Project filter dialog ─────────────────────────────────────────────────────

interface ProjectFilterDialogProps {
  projects: Project[];
  selected: Set<string>;
  onConfirm: (next: Set<string>) => void;
  onClose: () => void;
}

const ProjectFilterDialog: FC<ProjectFilterDialogProps> = ({
  projects,
  selected,
  onConfirm,
  onClose,
}) => {
  const [draft, setDraft] = useState(() => new Set(selected));
  const [nameFilter, setNameFilter] = useState('');
  const [startAfter, setStartAfter] = useState('');
  const [endBefore, setEndBefore] = useState('');

  const visible = useMemo(() => {
    return projects.filter((p) => {
      if (nameFilter && !p.name.toLowerCase().includes(nameFilter.toLowerCase()))
        return false;
      if (startAfter && p.start_date && p.start_date < startAfter) return false;
      if (endBefore && p.end_date && p.end_date > endBefore) return false;
      return true;
    });
  }, [projects, nameFilter, startAfter, endBefore]);

  const allVisibleSelected = visible.every((p) => draft.has(p.uuid));

  const toggleAll = () => {
    const next = new Set(draft);
    if (allVisibleSelected) {
      visible.forEach((p) => next.delete(p.uuid));
    } else {
      visible.forEach((p) => next.add(p.uuid));
    }
    setDraft(next);
  };

  const toggle = (uuid: string) => {
    const next = new Set(draft);
    if (next.has(uuid)) next.delete(uuid);
    else next.add(uuid);
    setDraft(next);
  };

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select projects</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1">Search</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Filter by name…"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label small mb-1">Start date — after</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={startAfter}
                  onChange={(e) => setStartAfter(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label small mb-1">End date — before</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={endBefore}
                  onChange={(e) => setEndBefore(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={allVisibleSelected && visible.length > 0}
                onChange={toggleAll}
                id="select-all-visible"
              />
              <label htmlFor="select-all-visible" className="form-check-label small">
                {allVisibleSelected ? 'Deselect' : 'Select'} all visible ({visible.length})
              </label>
              <span className="ms-auto text-muted small">
                {draft.size} of {projects.length} selected
              </span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }} className="border rounded p-2">
              {visible.length === 0 && (
                <p className="text-muted small mb-0 p-2">No projects match the filters.</p>
              )}
              {visible.map((p) => (
                <div key={p.uuid} className="d-flex align-items-start gap-2 py-1">
                  <input
                    type="checkbox"
                    className="form-check-input mt-1"
                    checked={draft.has(p.uuid)}
                    onChange={() => toggle(p.uuid)}
                    id={`proj-${p.uuid}`}
                  />
                  <label
                    htmlFor={`proj-${p.uuid}`}
                    className="form-check-label flex-grow-1"
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="fw-semibold">{p.name}</span>
                    {(p.start_date || p.end_date) && (
                      <span className="text-muted small ms-2">
                        {p.start_date ?? '?'} → {p.end_date ?? 'ongoing'}
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onConfirm(draft)}
            >
              Apply ({draft.size} project{draft.size !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main tab ──────────────────────────────────────────────────────────────────

export const OrganisationReportsTab: FC = () => {
  const customer = useSelector(getCustomer);
  const [loadTriggered, setLoadTriggered] = useState(false);
  const [showLoadPrompt, setShowLoadPrompt] = useState(true);

  // ── Pre-filter: year / month ─────────────────────────────────────────────
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);

  // ── Pre-filter: project search / date range ──────────────────────────────
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStartAfter, setProjectStartAfter] = useState('');
  const [projectEndBefore, setProjectEndBefore] = useState('');

  // ── User mapping: load-all toggle ────────────────────────────────────────
  const [loadAllUserMappings, setLoadAllUserMappings] = useState(false);

  // ── Slow-load warning ────────────────────────────────────────────────────
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // ── Stage 1: Fetch all projects ──────────────────────────────────────────
  const [projectProgress, setProjectProgress] = useState({ done: 0, total: 0, statusMsg: '' });

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['openportal-org-projects', customer?.uuid, projectSearch, projectStartAfter, projectEndBefore],
    queryFn: async () => {
      const cacheKey = `org-projects-${customer!.uuid}-${projectSearch}-${projectStartAfter}-${projectEndBefore}`;
      const cached = getCached<Project[]>(cacheKey, TTL.LISTS);
      if (cached) return cached;
      let allProjects: Project[] = [];
      let page = 1;
      let totalPages: number | undefined;
      setProjectProgress({ done: 0, total: 0, statusMsg: 'Starting…' });
      while (true) {
        const result = await projectsList({
          query: {
            customer: customer!.uuid,
            page_size: 25,
            o: ['name'],
            page,
            is_terminated: true,
            ...(projectSearch ? { query: projectSearch } : {}),
            ...(projectStartAfter ? { start_date_after: projectStartAfter } : {}),
            ...(projectEndBefore ? { end_date_before: projectEndBefore } : {}),
          } as any,
        });
        allProjects = allProjects.concat(result.data);
        if (page === 1) {
          const count = (result.response as any)?.data?.count;
          if (typeof count === 'number') totalPages = Math.ceil(count / 25);
        }
        setProjectProgress({
          done: page,
          total: totalPages ?? 0,
          statusMsg: totalPages
            ? `Downloading page ${page} of ${totalPages}`
            : `Downloading page ${page}…`,
        });
        if (!getNextPageUrl(result.response)) break;
        page++;
      }
      setCached(cacheKey, allProjects);
      return allProjects;
    },
    enabled: !!customer && loadTriggered,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // ── Project selection state ──────────────────────────────────────────────
  const allProjectUuids = useMemo(
    () => new Set((projects ?? []).map((p) => p.uuid)),
    [projects],
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const effectiveSelected = selectedProjects.size > 0 ? selectedProjects : allProjectUuids;
  const selectedUuids = useMemo(() => [...effectiveSelected], [effectiveSelected]);

  // ── Stage 2: Fetch reports ───────────────────────────────────────────────
  const [fetchProgress, setFetchProgress] = useState({ done: 0, total: 0 });

  const {
    data: reportData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['openportal-org-reports', customer?.uuid, selectedUuids, filterYear, filterMonth],
    queryFn: async () => {
      setFetchProgress({ done: 0, total: selectedUuids.length });
      const results = await Promise.all(
        selectedUuids.map(async (uuid) => {
          const [usage, storage] = await Promise.all([
            fetchUsageReports({ project_uuid: uuid, year: filterYear, month: filterMonth }),
            fetchStorageReports({ project_uuid: uuid, year: filterYear, month: filterMonth }),
          ]);
          setFetchProgress((prev) => ({ ...prev, done: prev.done + 1 }));
          return [usage, storage] as const;
        }),
      );
      return {
        usage: results.flatMap(([u]) => u),
        storage: results.flatMap(([, s]) => s),
      };
    },
    enabled: selectedUuids.length > 0 && loadTriggered,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const allUsage = reportData?.usage ?? [];
  const allStorage = reportData?.storage ?? [];

  // ── Stage 3: Fetch name mappings ─────────────────────────────────────────
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
          ...new Set([
            ...usageReports.map((r) => r.resource),
            ...storageReports.map((r) => r.resource),
          ]),
        ];
        const projectIds = [
          ...new Set([
            ...usageReports.map((r) => r.project),
            ...storageReports.map((r) => r.project),
          ]),
        ];

        // Top users by usage, capped at MAX_USER_MAPPINGS
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
        const userIdsCapped = loadAllUserMappings
          ? usersWithUsage
          : usersWithUsage.slice(0, MAX_USER_MAPPINGS);
        const usersMappingsTruncated = !loadAllUserMappings && usersWithUsage.length > MAX_USER_MAPPINGS;

        const ob = mappingBatchCount(offeringIds);
        const pb = mappingBatchCount(projectIds);
        const ub = mappingBatchCount(userIdsCapped);
        const total = ob + pb + ub;
        let cum = 0;

        console.debug('[OpenPortal org] mappings start:', { offerings: offeringIds.length, projects: projectIds.length, users: userIdsCapped.length, total });
        setMappingsProgress({ done: 0, total, statusMsg: 'Offering names…' });

        const offerings = await fetchOfferingMapping(offeringIds, (done) => {
          if (cancelled) return;
          cum = done;
          setMappingsProgress({ done: cum, total, statusMsg: `Offering names — ${done} of ${ob}` });
        });
        if (cancelled) return;
        cum = ob;
        setMappingsProgress({ done: cum, total, statusMsg: 'Project names…' });

        const projMaps = await fetchProjectMapping(projectIds, (done) => {
          if (cancelled) return;
          cum = ob + done;
          setMappingsProgress({ done: cum, total, statusMsg: `Project names — ${done} of ${pb}` });
        });
        if (cancelled) return;
        cum = ob + pb;
        setMappingsProgress({ done: cum, total, statusMsg: 'User names…' });

        const users = await fetchUserMapping(userIdsCapped, (done) => {
          if (cancelled) return;
          cum = ob + pb + done;
          setMappingsProgress({ done: cum, total, statusMsg: `User names — ${done} of ${ub}` });
        });
        if (cancelled) return;

        console.debug('[OpenPortal org] mappings done:', { offerings: Object.keys(offerings).length, projects: Object.keys(projMaps).length, users: Object.keys(users).length });

        const maps = {
          offering: Object.fromEntries(Object.entries(offerings).filter(([, v]) => v != null).map(([k, v]) => [k, v.name])),
          project: Object.fromEntries(Object.entries(projMaps).filter(([, v]) => v != null).map(([k, v]) => [k, v.name])),
          user: Object.fromEntries(Object.entries(users).filter(([, v]) => v != null).map(([k, v]) => [k, v.full_name])),
        } as NameMaps;
        setMapsResult({
          maps,
          truncatedUserCount: usersMappingsTruncated ? usersWithUsage.length - MAX_USER_MAPPINGS : 0,
        });
      } catch (err) {
        console.error('[OpenPortal org] mapping error:', err);
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
  const loadingStage =
    projectsLoading
      ? 1
      : reportsLoading
        ? 2
        : mappingsLoading
          ? 3
          : 0;

  // ── Slow-load warning timer ──────────────────────────────────────────────
  useEffect(() => {
    const isLoading = projectsLoading || reportsLoading || loadingStage === 3;
    if (!isLoading) {
      setShowSlowWarning(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowWarning(true), 5000);
    return () => clearTimeout(timer);
  }, [projectsLoading, reportsLoading, loadingStage]);

  return (
    <div className="container-fluid py-4">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <h4 className="mb-0">Usage Report</h4>

        {projects && projects.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">
              {effectiveSelected.size} of {projects.length} project
              {projects.length !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setDialogOpen(true)}
            >
              Filter selected projects
            </button>
          </div>
        )}

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

        {loadTriggered && <div className="ms-auto d-flex align-items-center gap-2">
          {(() => {
            const age = customer ? getCacheAge(`org-projects-${customer.uuid}`) : null;
            return age ? (
              <span className="text-muted small">Cached {formatCacheAge(age)}</span>
            ) : null;
          })()}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              clearMappingCache();
              if (customer) {
                clearCached(
                  `org-projects-${customer.uuid}`,
                );
              }
              refetchProjects();
              if (loadTriggered) refetchReports();
            }}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowLoadPrompt(true)}
          >
            Load new data…
          </button>
        </div>}
      </div>

      {/* ── Load prompt ──────────────────────────────────────────────── */}
      {showLoadPrompt && !projectsLoading && !reportsLoading && (
        <div className="card mb-4">
          <div className="card-body">
            <p className="mb-2 fw-semibold">Usage reports not yet loaded</p>

            {/* Project pre-filters */}
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label small mb-1">Project search</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Name search (applied at load time)…"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label small mb-1">Started after</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={projectStartAfter}
                  onChange={(e) => setProjectStartAfter(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label small mb-1">Started before</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={projectEndBefore}
                  onChange={(e) => setProjectEndBefore(e.target.value)}
                />
              </div>
            </div>

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
              Fetches reports for each project in parallel — this may take 15–30 seconds for large
              organisations. Tip: use the project search and date filters above to load only the
              projects you need — much faster for large organisations.
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

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      {loadingStage === 1 && (
        <StageProgress
          stage={1}
          total={3}
          label="Loading project list"
          done={projectProgress.done}
          max={projectProgress.total}
          statusMsg={projectProgress.statusMsg || undefined}
        />
      )}
      {loadingStage === 2 && (
        <StageProgress
          stage={2}
          total={3}
          label="Loading reports"
          done={fetchProgress.done}
          max={fetchProgress.total}
        />
      )}
      {loadingStage === 3 && (
        <StageProgress
          stage={3}
          total={3}
          label="Loading name mappings"
          done={mappingsProgress.done}
          max={mappingsProgress.total}
          statusMsg={mappingsProgress.statusMsg || undefined}
        />
      )}

      {/* ── Slow-load warning ────────────────────────────────────────── */}
      {showSlowWarning && (
        <div className="alert alert-warning d-flex align-items-start gap-3 mb-3">
          <div className="flex-grow-1">
            <strong>This is taking a while.</strong>
            <div className="small mt-1">
              To speed things up: use a specific year/month filter, or search for fewer projects when loading.
              Large datasets with many users and projects take longer to process.
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

      {/* ── Errors ───────────────────────────────────────────────────── */}
      {projectsError && (
        <LoadingErred message="Failed to load projects" loadData={refetchProjects} />
      )}
      {reportsError && (
        <LoadingErred message="Failed to load reports" loadData={refetchReports} />
      )}

      {loadTriggered &&
        !projectsLoading &&
        !reportsLoading &&
        !projectsError &&
        !reportsError &&
        allUsage.length === 0 &&
        allStorage.length === 0 &&
        selectedUuids.length > 0 && (
          <p className="text-muted">
            No OpenPortal reports found for the selected projects.
          </p>
        )}

      {/* ── Truncated user mapping notice ────────────────────────────── */}
      {usersTruncatedCount > 0 && nameMaps !== undefined && (
        <div className="alert alert-info d-flex align-items-center gap-2 mb-3 py-2">
          <small>
            User names shown for top {MAX_USER_MAPPINGS} users by usage only.{' '}
            {usersTruncatedCount} more user{usersTruncatedCount !== 1 ? 's' : ''} not mapped.
          </small>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary ms-auto"
            onClick={() => {
              setLoadAllUserMappings(true);
            }}
          >
            Load all user names
          </button>
        </div>
      )}

      {/* ── Charts ───────────────────────────────────────────────────── */}
      {activeUsage.length > 0 && nameMaps !== undefined && !showLoadPrompt && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Usage</div>
          <div className="card-body">
            <UsageReportVis reports={activeUsage} height="400px" nameMaps={nameMaps} />
          </div>
        </div>
      )}

      {activeStorage.length > 0 && nameMaps !== undefined && !showLoadPrompt && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Storage</div>
          <div className="card-body">
            <StorageReportVis reports={activeStorage} height="360px" nameMaps={nameMaps} />
          </div>
        </div>
      )}

      {/* ── Project filter dialog ─────────────────────────────────────── */}
      {dialogOpen && projects && (
        <ProjectFilterDialog
          projects={projects}
          selected={effectiveSelected}
          onConfirm={(next) => {
            setSelectedProjects(next);
            setSelectedMonth('all');
            setDialogOpen(false);
          }}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};
