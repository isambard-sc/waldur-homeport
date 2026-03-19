/**
 * Organisation-level OpenPortal reports tab.
 */

import { useQuery } from '@tanstack/react-query';
import { Project, projectsList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { getCustomer } from '@waldur/workspace/selectors';

import {
  fetchUsageReports,
  fetchStorageReports,
  fetchOfferingMapping,
  fetchProjectMapping,
  fetchUserMapping,
} from './api';
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

// ── Stage progress bar ────────────────────────────────────────────────────────

interface StageProgressProps {
  stage: number;    // 1-based current stage
  total: number;    // total stages
  label: string;
  done: number;
  max: number;
}

const StageProgress: FC<StageProgressProps> = ({ stage, total, label, done, max }) => {
  const pct = max > 0 ? Math.round((done / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small text-muted mb-1">
        <span>
          Stage {stage} of {total} — {label}
        </span>
        {max > 1 && (
          <span>
            {done} / {max}
          </span>
        )}
      </div>
      <div className="progress" style={{ height: 8 }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          style={{ width: `${max <= 1 ? 100 : pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Main tab ──────────────────────────────────────────────────────────────────

export const OrganisationReportsTab: FC = () => {
  const customer = useSelector(getCustomer);
  const [loadTriggered, setLoadTriggered] = useState(false);

  // ── Pre-filter: year / month ─────────────────────────────────────────────
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);

  // ── Stage 1: Fetch all projects ──────────────────────────────────────────
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['openportal-org-projects', customer?.uuid],
    queryFn: () =>
      getAllPages<Project>((page) =>
        projectsList({
          query: { customer: customer!.uuid, page_size: 25, o: ['name'], page },
        }),
      ),
    enabled: !!customer && loadTriggered,
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
          const result = await Promise.all([
            fetchUsageReports({ project_uuid: uuid, year: filterYear, month: filterMonth }),
            fetchStorageReports({ project_uuid: uuid, year: filterYear, month: filterMonth }),
          ]);
          setFetchProgress((prev) => ({ ...prev, done: prev.done + 1 }));
          return result;
        }),
      );
      return {
        usage: results.flatMap(([u]) => u),
        storage: results.flatMap(([, s]) => s),
      };
    },
    enabled: selectedUuids.length > 0 && loadTriggered,
  });

  const allUsage = reportData?.usage ?? [];
  const allStorage = reportData?.storage ?? [];

  // ── Stage 3: Fetch name mappings ─────────────────────────────────────────
  const [mappingsLoading, setMappingsLoading] = useState(false);

  const { data: nameMaps } = useQuery<NameMaps>({
    queryKey: ['openportal-org-mappings', customer?.uuid, selectedUuids, filterYear, filterMonth],
    queryFn: async () => {
      setMappingsLoading(true);
      try {
        const usageReports = reportData!.usage;
        const storageReports = reportData!.storage;
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
        const userIds: string[] = [
          ...new Set<string>(usageReports.flatMap((r) => Object.keys(r.users))),
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
  const loadingStage =
    projectsLoading
      ? 1
      : reportsLoading
        ? 2
        : mappingsLoading
          ? 3
          : 0;

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
              Select projects
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

        <button
          type="button"
          className="btn btn-secondary btn-sm ms-auto"
          onClick={() => {
            refetchProjects();
            if (loadTriggered) refetchReports();
          }}
        >
          Refresh
        </button>
      </div>

      {/* ── Load prompt ──────────────────────────────────────────────── */}
      {!loadTriggered && !reportData && (
        <div className="card mb-4">
          <div className="card-body">
            <p className="mb-2 fw-semibold">Usage reports not yet loaded</p>

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
              organisations. Filtering to a specific year or month will be much faster.
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

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      {loadingStage === 1 && (
        <StageProgress
          stage={1}
          total={3}
          label="Loading project list"
          done={0}
          max={0}
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
          done={0}
          max={0}
        />
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

      {/* ── Charts ───────────────────────────────────────────────────── */}
      {activeUsage.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Usage</div>
          <div className="card-body">
            <UsageReportVis reports={activeUsage} height="400px" nameMaps={nameMaps} />
          </div>
        </div>
      )}

      {activeStorage.length > 0 && (
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
