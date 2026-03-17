/**
 * Organisation-level OpenPortal reports tab.
 *
 * Fetches usage and storage reports for all projects in the current customer
 * organisation. Reports are fetched in parallel (one request per project) and
 * then combined client-side before being passed to UsageReportVis /
 * StorageReportVis.
 *
 * Controls:
 *   - Project filter dialog  — select which projects to include
 *   - Resource dropdown       — filter by HPC destination
 *   - Month dropdown          — "All time" or a specific YYYY-MM
 *
 * Visible to staff and support users only (via route permissions).
 */

import { useQuery } from '@tanstack/react-query';
import { Project, projectsList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getCustomer } from '@waldur/workspace/selectors';

import { fetchUsageReports, fetchStorageReports } from './api';
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
      if (
        nameFilter &&
        !p.name.toLowerCase().includes(nameFilter.toLowerCase())
      )
        return false;
      if (startAfter && p.start_date && p.start_date < startAfter)
        return false;
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
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            {/* Filters */}
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
                <label className="form-label small mb-1">
                  Start date — after
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={startAfter}
                  onChange={(e) => setStartAfter(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-4">
                <label className="form-label small mb-1">
                  End date — before
                </label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={endBefore}
                  onChange={(e) => setEndBefore(e.target.value)}
                />
              </div>
            </div>

            {/* Select/deselect all visible */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={allVisibleSelected && visible.length > 0}
                onChange={toggleAll}
                id="select-all-visible"
              />
              <label
                htmlFor="select-all-visible"
                className="form-check-label small"
              >
                {allVisibleSelected ? 'Deselect' : 'Select'} all visible (
                {visible.length})
              </label>
              <span className="ms-auto text-muted small">
                {draft.size} of {projects.length} selected
              </span>
            </div>

            {/* Project list */}
            <div
              style={{ maxHeight: 320, overflowY: 'auto' }}
              className="border rounded p-2"
            >
              {visible.length === 0 && (
                <p className="text-muted small mb-0 p-2">
                  No projects match the filters.
                </p>
              )}
              {visible.map((p) => (
                <div
                  key={p.uuid}
                  className="d-flex align-items-start gap-2 py-1"
                >
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
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
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

  // ── Fetch all projects in the organisation ──────────────────────────────
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['openportal-org-projects', customer?.uuid],
    queryFn: () =>
      getAllPages<Project>((page) =>
        projectsList({ query: { customer: customer!.uuid, page_size: 25, o: ['name'], page } }),
      ),
    enabled: !!customer,
  });

  // ── Project selection state ─────────────────────────────────────────────
  // Default: all projects selected
  const allProjectUuids = useMemo(
    () => new Set((projects ?? []).map((p) => p.uuid)),
    [projects],
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // When projects first load, select them all
  const effectiveSelected =
    selectedProjects.size > 0 ? selectedProjects : allProjectUuids;

  const selectedUuids = useMemo(
    () => [...effectiveSelected],
    [effectiveSelected],
  );

  // ── Fetch reports for selected projects in parallel ─────────────────────
  const [fetchProgress, setFetchProgress] = useState({ done: 0, total: 0 });

  const {
    data: reportData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['openportal-org-reports', customer?.uuid, selectedUuids],
    queryFn: async () => {
      setFetchProgress({ done: 0, total: selectedUuids.length });
      const results = await Promise.all(
        selectedUuids.map(async (uuid) => {
          const result = await Promise.all([
            fetchUsageReports({ project_uuid: uuid }),
            fetchStorageReports({ project_uuid: uuid }),
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
    enabled: selectedUuids.length > 0,
  });

  const allUsage = reportData?.usage ?? [];
  const allStorage = reportData?.storage ?? [];

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

  const usageForResource = allUsage.filter(
    (r) => r.resource === activeResource,
  );
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
  const activeMonth = selectedMonth;

  const activeUsage: ProjectUsageReport[] =
    activeMonth === 'all'
      ? usageForResource
      : (usageByMonth[activeMonth] ?? []);
  const activeStorage: ProjectStorageReport[] =
    activeMonth === 'all'
      ? storageForResource
      : (storageByMonth[activeMonth] ?? []);

  const isLoading = projectsLoading;

  return (
    <div className="container-fluid py-4">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <h4 className="mb-0">Usage Report</h4>

        {/* Project selector */}
        {projects && projects.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">
              {effectiveSelected.size} of {projects.length} project
              {projects.length !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setDialogOpen(true)}
            >
              Select projects
            </button>
          </div>
        )}

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
          onClick={() => {
            refetchProjects();
            refetchReports();
          }}
        >
          Refresh
        </button>
      </div>

      {/* ── Progress bar (shown while fetching per-project reports) ─── */}
      {reportsLoading && fetchProgress.total > 0 && (
        <div className="mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Loading reports…</span>
            <span>
              {fetchProgress.done} / {fetchProgress.total} projects
            </span>
          </div>
          <div className="progress" style={{ height: 6 }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              style={{
                width: `${Math.round((fetchProgress.done / fetchProgress.total) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── Status ───────────────────────────────────────────────────── */}
      {isLoading && <LoadingSpinner />}

      {projectsError && (
        <LoadingErred
          message="Failed to load projects"
          loadData={refetchProjects}
        />
      )}

      {reportsError && (
        <LoadingErred
          message="Failed to load reports"
          loadData={refetchReports}
        />
      )}

      {!projectsLoading &&
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

      {/* ── Usage chart ──────────────────────────────────────────────── */}
      {activeUsage.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Usage</div>
          <div className="card-body">
            <UsageReportVis reports={activeUsage} height="400px" />
          </div>
        </div>
      )}

      {/* ── Storage chart ────────────────────────────────────────────── */}
      {activeStorage.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold">Storage</div>
          <div className="card-body">
            <StorageReportVis reports={activeStorage} height="360px" />
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
