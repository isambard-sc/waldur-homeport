/**
 * Organisation-level allocation summary tab.
 *
 * Fetches ProjectAccountingSummary records for all projects in the current
 * customer organisation via the openportal-accounting-summary endpoint.
 *
 * Features:
 *   - Project filter dialog  — same look as OrganisationReportsTab
 *   - Summary statistics     — total credits awarded / spent / remaining
 *   - Stacked bar chart      — predicted daily credits-remaining per project,
 *                              assuming linear burn from today → end date
 *   - Line chart toggle      — same data rendered as stacked area lines
 *   - Warning notice         — projects without end dates (credits untracked)
 *
 * Visible to staff and support users only (via route permissions).
 */

import { useQuery } from '@tanstack/react-query';
import {
  openportalAccountingSummaryList,
  Project,
  projectsList,
  ProjectAccountingSummary,
} from 'waldur-js-client';
import React, { FC, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { FileXlsIcon } from '@phosphor-icons/react';

import { getAllPages } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import { downloadAllocationExcel } from './reportExcel';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse a decimal string from the API into a float. */
const parseCredits = (v: string): number => parseFloat(v) || 0;

/** Format a credit value for display (2 d.p., thousands separators). */
const fmtCredits = (v: number): string =>
  v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Add `days` calendar days to a Date, returning a new Date. */
const addDays = (d: Date, days: number): Date => {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
};

/** Format a Date as YYYY-MM-DD. */
const toDateStr = (d: Date): string => d.toISOString().slice(0, 10);

/** Number of whole calendar days between two dates (b − a). */
const daysBetween = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86_400_000);

// ── Chart builder ─────────────────────────────────────────────────────────────

type ChartType = 'bar' | 'line';
type GroupBy = 'day' | 'month';

/** Last calendar day of the month containing `d`. */
const lastDayOfMonth = (d: Date): Date => {
  const out = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  out.setHours(0, 0, 0, 0);
  return out;
};

/**
 * Compute remaining credits for a project at a given reference date.
 * Returns 0 if the reference date is on or after the project end date.
 */
const remainingAtDate = (
  remaining: number,
  totalDays: number,
  today: Date,
  refDate: Date,
  endDate: Date,
): number => {
  if (refDate >= endDate) return 0;
  const daysFromToday = daysBetween(today, refDate);
  const daysLeft = totalDays - daysFromToday;
  return Math.max(0, Math.round((remaining * daysLeft) / totalDays));
};

const buildChartOptions = (
  summaries: ProjectAccountingSummary[],
  chartType: ChartType,
  groupBy: GroupBy,
  currencyName: string,
): object | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only projects with a future end date
  const eligible = summaries.filter((s) => {
    if (!s.end_date) return false;
    const end = new Date(s.end_date);
    end.setHours(0, 0, 0, 0);
    return end > today;
  });

  if (eligible.length === 0) return null;

  const endDates = eligible.map((s) => {
    const d = new Date(s.end_date!);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const maxEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));

  const isLine = chartType === 'line';

  let xLabels: string[];
  let refDates: Date[]; // the date used to sample remaining credits for each x point

  if (groupBy === 'month') {
    // One point per month: sample remaining credits at the last day of each month
    // (capped to the day before maxEnd)
    xLabels = [];
    refDates = [];
    const cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    cursor.setHours(0, 0, 0, 0);
    while (cursor < maxEnd) {
      const monthEnd = lastDayOfMonth(cursor);
      const refDate = monthEnd < maxEnd ? monthEnd : addDays(maxEnd, -1);
      xLabels.push(toDateStr(cursor).slice(0, 7)); // YYYY-MM
      refDates.push(refDate);
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    // One point per day: today → day before maxEnd
    xLabels = [];
    refDates = [];
    for (let i = 0; ; i++) {
      const d = addDays(today, i);
      if (d >= maxEnd) break;
      xLabels.push(toDateStr(d));
      refDates.push(d);
    }
  }

  if (xLabels.length === 0) return null;

  const series = eligible.map((s) => {
    const remaining =
      parseCredits(s.total_credits) -
      parseCredits(s.total_spend) -
      parseCredits(s.current_month_spend);

    const end = new Date(s.end_date!);
    end.setHours(0, 0, 0, 0);
    const totalDays = Math.max(1, daysBetween(today, end));

    return {
      name: s.project_name,
      type: isLine ? 'line' : 'bar',
      stack: 'credits',
      ...(isLine ? { areaStyle: { opacity: 0.4 } } : {}),
      data: refDates.map((refDate) =>
        remainingAtDate(remaining, totalDays, today, refDate, end),
      ),
    };
  });

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: isLine ? 'cross' : 'shadow' },
    },
    legend: { type: 'scroll', bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: {
        rotate: 45,
        interval: groupBy === 'day' ? 6 : 0,
      },
    },
    yAxis: {
      type: 'value',
      name: `${currencyName} remaining`,
    },
    dataZoom: [{ type: 'inside' }, { type: 'slider', bottom: 35 }],
    series,
  };
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

  const visible = useMemo(
    () =>
      projects.filter((p) => {
        if (
          nameFilter &&
          !p.name.toLowerCase().includes(nameFilter.toLowerCase())
        )
          return false;
        if (startAfter && p.start_date && p.start_date < startAfter)
          return false;
        if (endBefore && p.end_date && p.end_date > endBefore) return false;
        return true;
      }),
    [projects, nameFilter, startAfter, endBefore],
  );

  const allVisibleSelected = visible.every((p) => draft.has(p.uuid));

  const toggleAll = () => {
    const next = new Set(draft);
    if (allVisibleSelected) visible.forEach((p) => next.delete(p.uuid));
    else visible.forEach((p) => next.add(p.uuid));
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

            <div className="d-flex align-items-center gap-2 mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={allVisibleSelected && visible.length > 0}
                onChange={toggleAll}
                id="alloc-select-all"
              />
              <label
                htmlFor="alloc-select-all"
                className="form-check-label small"
              >
                {allVisibleSelected ? 'Deselect' : 'Select'} all visible (
                {visible.length})
              </label>
              <span className="ms-auto text-muted small">
                {draft.size} of {projects.length} selected
              </span>
            </div>

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
                    id={`alloc-proj-${p.uuid}`}
                  />
                  <label
                    htmlFor={`alloc-proj-${p.uuid}`}
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

// ── Summary stat card ─────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const StatCard: FC<StatCardProps> = ({ label, value, variant = 'default' }) => {
  const borderClass =
    variant === 'success'
      ? 'border-success'
      : variant === 'warning'
        ? 'border-warning'
        : variant === 'danger'
          ? 'border-danger'
          : '';
  return (
    <div className={`card flex-fill ${borderClass}`} style={{ minWidth: 180 }}>
      <div className="card-body py-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className="fs-5 fw-bold">{value}</div>
      </div>
    </div>
  );
};

// ── Main tab ──────────────────────────────────────────────────────────────────

export const OrganisationAllocationTab: FC = () => {
  const customer = useSelector(getCustomer);

  // ── Fetch all projects in the organisation ──────────────────────────────
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['openportal-alloc-projects', customer?.uuid],
    queryFn: () =>
      getAllPages<Project>((page) =>
        projectsList({
          query: { customer: customer!.uuid, page_size: 25, o: ['name'], page },
        }),
      ),
    enabled: !!customer,
  });

  // ── Project selection ───────────────────────────────────────────────────
  const allProjectUuids = useMemo(
    () => new Set((projects ?? []).map((p) => p.uuid)),
    [projects],
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const effectiveSelected =
    selectedProjects.size > 0 ? selectedProjects : allProjectUuids;

  // ── Fetch accounting summaries for the organisation ─────────────────────
  const {
    data: allSummaries,
    isLoading: summariesLoading,
    error: summariesError,
    refetch: refetchSummaries,
  } = useQuery({
    queryKey: ['openportal-accounting-summary', customer?.uuid],
    queryFn: () =>
      getAllPages<ProjectAccountingSummary>((page) =>
        openportalAccountingSummaryList({
          query: { customer_uuid: customer!.uuid, page_size: 100, page },
        }),
      ),
    enabled: !!customer,
  });

  // ── Filter summaries to selected projects ───────────────────────────────
  const summaries = useMemo(
    () =>
      (allSummaries ?? []).filter((s) => effectiveSelected.has(s.project_uuid)),
    [allSummaries, effectiveSelected],
  );

  // ── Aggregate stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalCredits = 0;
    let totalSpent = 0;
    for (const s of summaries) {
      totalCredits += parseCredits(s.total_credits);
      totalSpent +=
        parseCredits(s.total_spend) + parseCredits(s.current_month_spend);
    }
    return {
      totalCredits,
      totalSpent,
      remaining: totalCredits - totalSpent,
    };
  }, [summaries]);

  // ── Chart controls ──────────────────────────────────────────────────────
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  const currencyName = ENV.plugins.WALDUR_CORE.CURRENCY_NAME;

  // ── Chart options ───────────────────────────────────────────────────────
  const chartOptions = useMemo(
    () => buildChartOptions(summaries, chartType, groupBy, currencyName),
    [summaries, chartType, groupBy, currencyName],
  );

  // ── Projects without end dates ──────────────────────────────────────────
  const noEndDateSummaries = useMemo(
    () => summaries.filter((s) => !s.end_date),
    [summaries],
  );

  const noEndDateUnspent = useMemo(
    () =>
      noEndDateSummaries.reduce(
        (acc, s) =>
          acc +
          Math.max(
            0,
            parseCredits(s.total_credits) -
              parseCredits(s.total_spend) -
              parseCredits(s.current_month_spend),
          ),
        0,
      ),
    [noEndDateSummaries],
  );

  const isLoading = projectsLoading || summariesLoading;

  return (
    <div className="container-fluid py-4">
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <h4 className="mb-0">Allocation Summary</h4>

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

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm ms-auto"
          onClick={() => {
            refetchProjects();
            refetchSummaries();
          }}
        >
          Refresh
        </button>
      </div>

      {/* ── Status ─────────────────────────────────────────────────────── */}
      {isLoading && <LoadingSpinner />}

      {projectsError && (
        <LoadingErred
          message="Failed to load projects"
          loadData={refetchProjects}
        />
      )}

      {summariesError && (
        <LoadingErred
          message="Failed to load accounting summaries"
          loadData={refetchSummaries}
        />
      )}

      {!isLoading && !projectsError && !summariesError && summaries.length === 0 && (
        <p className="text-muted">
          No accounting summaries found for the selected projects.
        </p>
      )}

      {/* ── Summary stats ───────────────────────────────────────────────── */}
      {summaries.length > 0 && (
        <div className="d-flex flex-wrap gap-3 mb-4">
          <StatCard
            label={`Total ${currencyName} awarded`}
            value={fmtCredits(stats.totalCredits)}
          />
          <StatCard
            label={`Total ${currencyName} spent`}
            value={fmtCredits(stats.totalSpent)}
            variant="warning"
          />
          <StatCard
            label={`Remaining ${currencyName}`}
            value={fmtCredits(stats.remaining)}
            variant={stats.remaining > 0 ? 'success' : 'danger'}
          />
        </div>
      )}

      {/* ── Burn-down chart ─────────────────────────────────────────────── */}
      {summaries.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold d-flex align-items-center gap-3">
            <span>Predicted allocation burn-down</span>

            {chartOptions && (
              <>
                <div className="btn-group btn-group-sm ms-auto" role="group">
                  <button
                    type="button"
                    className={`btn btn-${groupBy === 'day' ? 'primary' : 'secondary'}`}
                    onClick={() => setGroupBy('day')}
                  >
                    Day
                  </button>
                  <button
                    type="button"
                    className={`btn btn-${groupBy === 'month' ? 'primary' : 'secondary'}`}
                    onClick={() => setGroupBy('month')}
                  >
                    Month
                  </button>
                </div>

                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn btn-${chartType === 'bar' ? 'primary' : 'secondary'}`}
                    onClick={() => setChartType('bar')}
                  >
                    Bar
                  </button>
                  <button
                    type="button"
                    className={`btn btn-${chartType === 'line' ? 'primary' : 'secondary'}`}
                    onClick={() => setChartType('line')}
                  >
                    Line
                  </button>
                </div>
              </>
            )}

            <Tip id="tip-alloc-excel" label="Download Excel">
              <button
                type="button"
                className="text-btn text-hover-primary"
                onClick={() =>
                  downloadAllocationExcel(
                    summaries,
                    currencyName,
                    `allocation-summary-${customer?.name ?? 'org'}`,
                  )
                }
              >
                <FileXlsIcon size={20} />
              </button>
            </Tip>
          </div>
          <div className="card-body">
            {chartOptions ? (
              <EChart options={chartOptions} height="420px" />
            ) : (
              <p className="text-muted mb-0">
                No projects with future end dates — nothing to plot.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Warning: projects without end dates ─────────────────────────── */}
      {noEndDateSummaries.length > 0 && (
        <div className="alert alert-warning">
          <div className="d-flex align-items-start gap-2 mb-2">
            <span>⚠</span>
            <span>
              <strong>
                {noEndDateSummaries.length} project
                {noEndDateSummaries.length !== 1 ? 's have' : ' has'} no end
                date
              </strong>{' '}
              and{' '}
              {noEndDateSummaries.length !== 1 ? 'are' : 'is'} not shown in the
              burn-down chart. Together{' '}
              {noEndDateSummaries.length !== 1
                ? 'they represent'
                : 'it represents'}{' '}
              <strong>
                {fmtCredits(noEndDateUnspent)} {currencyName}
              </strong>{' '}
              of unspent allocation.
            </span>
          </div>
          <ul className="mb-0 ps-4">
            {noEndDateSummaries.map((s) => {
              const unspent = Math.max(
                0,
                parseCredits(s.total_credits) -
                  parseCredits(s.total_spend) -
                  parseCredits(s.current_month_spend),
              );
              return (
                <li key={s.project_uuid}>
                  <a
                    href={`/projects/${s.project_uuid}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.project_name}
                  </a>
                  {' — '}
                  {fmtCredits(unspent)} {currencyName} unspent
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Project filter dialog ────────────────────────────────────────── */}
      {dialogOpen && projects && (
        <ProjectFilterDialog
          projects={projects}
          selected={effectiveSelected}
          onConfirm={(next) => {
            setSelectedProjects(next);
            setDialogOpen(false);
          }}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};
