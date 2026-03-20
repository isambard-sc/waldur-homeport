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
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { FileXlsIcon } from '@phosphor-icons/react';

import { getNextPageUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { Tip } from '@waldur/core/Tooltip';
import { getCustomer } from '@waldur/workspace/selectors';

import { downloadAllocationExcel } from './reportExcel';
import {
  getCached,
  setCached,
  clearCached,
  getCacheAge,
  formatCacheAge,
  TTL,
} from './localStorageCache';
import { StageProgress } from './StageProgress';

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
      formatter: (params: any[]) => {
        const active = params
          .filter((p) => p.value !== 0 && p.value != null)
          .sort((a, b) => b.value - a.value);
        if (active.length === 0) return params[0]?.axisValueLabel ?? '';
        const rows = active
          .map(
            (p) =>
              `${p.marker}${p.seriesName}: <b>${Number(p.value).toFixed(2)}</b>`,
          )
          .join('<br/>');
        return `${active[0].axisValueLabel}<br/>${rows}`;
      },
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
    dataZoom: [{ type: 'slider', bottom: 35 }],
    series,
  };
};

// ── Consumption chart builder ─────────────────────────────────────────────────

/**
 * Builds ECharts options for the predicted daily/monthly consumption chart.
 * Each project's daily consumption rate = remaining / totalDays (linear burn).
 * For monthly grouping, rates are summed over the active days in each month.
 */
const buildConsumptionChartOptions = (
  summaries: ProjectAccountingSummary[],
  chartType: ChartType,
  groupBy: GroupBy,
  currencyName: string,
): object | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Per-project: constant daily consumption rate over project lifetime
  const projectData = eligible.map((s) => {
    const remaining =
      parseCredits(s.total_credits) -
      parseCredits(s.total_spend) -
      parseCredits(s.current_month_spend);
    const end = new Date(s.end_date!);
    end.setHours(0, 0, 0, 0);
    const totalDays = Math.max(1, daysBetween(today, end));
    return {
      name: s.project_name,
      dailyRate: Math.max(0, remaining) / totalDays,
      end,
    };
  });

  const round2 = (n: number) => Math.round(n * 100) / 100;

  let xLabels: string[];
  let series: object[];

  if (groupBy === 'day') {
    xLabels = [];
    for (let i = 0; ; i++) {
      const d = addDays(today, i);
      if (d >= maxEnd) break;
      xLabels.push(toDateStr(d));
    }
    series = projectData.map(({ name, dailyRate, end }) => ({
      name,
      type: isLine ? 'line' : 'bar',
      stack: 'consumption',
      ...(isLine ? { areaStyle: { opacity: 0.4 } } : {}),
      data: xLabels.map((dateStr) => {
        const d = new Date(dateStr);
        return d < end ? round2(dailyRate) : 0;
      }),
    }));
  } else {
    // Monthly: sum dailyRate × active days in that month
    xLabels = [];
    const monthStarts: Date[] = [];
    const cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    cursor.setHours(0, 0, 0, 0);
    while (cursor < maxEnd) {
      xLabels.push(toDateStr(cursor).slice(0, 7));
      monthStarts.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    series = projectData.map(({ name, dailyRate, end }) => ({
      name,
      type: isLine ? 'line' : 'bar',
      stack: 'consumption',
      ...(isLine ? { areaStyle: { opacity: 0.4 } } : {}),
      data: monthStarts.map((monthStart) => {
        const monthEnd = lastDayOfMonth(monthStart);
        // Active window: [max(today, monthStart), min(end-1, monthEnd)]
        const activeStart = monthStart >= today ? monthStart : today;
        const projectLastDay = addDays(end, -1);
        const activeEnd = projectLastDay <= monthEnd ? projectLastDay : monthEnd;
        const activeDays =
          activeEnd >= activeStart
            ? daysBetween(activeStart, activeEnd) + 1
            : 0;
        return round2(dailyRate * activeDays);
      }),
    }));
  }

  if (xLabels.length === 0) return null;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: isLine ? 'cross' : 'shadow' },
      formatter: (params: any[]) => {
        const active = params
          .filter((p) => p.value !== 0 && p.value != null)
          .sort((a, b) => b.value - a.value);
        if (active.length === 0) return params[0]?.axisValueLabel ?? '';
        const rows = active
          .map(
            (p) =>
              `${p.marker}${p.seriesName}: <b>${Number(p.value).toFixed(2)}</b>`,
          )
          .join('<br/>');
        return `${active[0].axisValueLabel}<br/>${rows}`;
      },
    },
    legend: { type: 'scroll', bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { rotate: 45, interval: groupBy === 'day' ? 6 : 0 },
    },
    yAxis: {
      type: 'value',
      name:
        groupBy === 'day'
          ? `${currencyName} / day`
          : `${currencyName} / month`,
    },
    dataZoom: [{ type: 'slider', bottom: 35 }],
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

  // ── Lazy-load — don't fire until user clicks "Load data" ─────────────────
  const [loadTriggered, setLoadTriggered] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStartAfter, setProjectStartAfter] = useState('');
  const [projectEndBefore, setProjectEndBefore] = useState('');

  // ── Fetch all projects in the organisation ──────────────────────────────
  const [projectProgress, setProjectProgress] = useState({ done: 0, total: 0, statusMsg: '' });

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['openportal-alloc-projects', customer?.uuid, projectSearch, projectStartAfter, projectEndBefore],
    queryFn: async () => {
      const cacheKey = `alloc-projects-${customer!.uuid}-${projectSearch}-${projectStartAfter}-${projectEndBefore}`;
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
  const [summariesProgress, setSummariesProgress] = useState({ done: 0, total: 0, statusMsg: '' });

  const {
    data: allSummaries,
    isLoading: summariesLoading,
    error: summariesError,
    refetch: refetchSummaries,
  } = useQuery({
    queryKey: ['openportal-accounting-summary', customer?.uuid],
    queryFn: async () => {
      const cacheKey = `alloc-summaries-${customer!.uuid}`;
      const cached = getCached<ProjectAccountingSummary[]>(cacheKey, TTL.LISTS);
      if (cached) return cached;
      let allItems: ProjectAccountingSummary[] = [];
      let page = 1;
      let totalPages: number | undefined;
      setSummariesProgress({ done: 0, total: 0, statusMsg: 'Starting…' });
      while (true) {
        const result = await openportalAccountingSummaryList({
          query: { customer_uuid: customer!.uuid, page_size: 100, page },
        });
        allItems = allItems.concat(result.data);
        if (page === 1) {
          const count = (result.response as any)?.data?.count;
          if (typeof count === 'number') totalPages = Math.ceil(count / 100);
        }
        setSummariesProgress({
          done: page,
          total: totalPages ?? 0,
          statusMsg: totalPages
            ? `Downloading page ${page} of ${totalPages}`
            : `Downloading page ${page}…`,
        });
        if (!getNextPageUrl(result.response)) break;
        page++;
      }
      setCached(cacheKey, allItems);
      return allItems;
    },
    enabled: !!customer && loadTriggered,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
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

  // ── Burn-down chart controls ────────────────────────────────────────────
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  // ── Consumption chart controls ──────────────────────────────────────────
  const [consumptionChartType, setConsumptionChartType] =
    useState<ChartType>('bar');
  const [consumptionGroupBy, setConsumptionGroupBy] = useState<GroupBy>('day');

  // ── Slow-load warning ───────────────────────────────────────────────────
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  const loadingStage = projectsLoading ? 1 : summariesLoading ? 2 : 0;

  useEffect(() => {
    const isLoading = projectsLoading || summariesLoading;
    if (!isLoading) {
      setShowSlowWarning(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowWarning(true), 5000);
    return () => clearTimeout(timer);
  }, [projectsLoading, summariesLoading]);

  // ── Excel download progress ─────────────────────────────────────────────
  const [excelProgress, setExcelProgress] = useState<{current: number; total: number} | null>(null);

  const currencyName = ENV.plugins.WALDUR_CORE.CURRENCY_NAME;

  // ── Chart options ───────────────────────────────────────────────────────
  const chartOptions = useMemo(
    () => buildChartOptions(summaries, chartType, groupBy, currencyName),
    [summaries, chartType, groupBy, currencyName],
  );

  const consumptionOptions = useMemo(
    () =>
      buildConsumptionChartOptions(
        summaries,
        consumptionChartType,
        consumptionGroupBy,
        currencyName,
      ),
    [summaries, consumptionChartType, consumptionGroupBy, currencyName],
  );

  // ── Concerning projects ─────────────────────────────────────────────────
  const [thresholds, setThresholds] = useState({
    slowStartMonths: 1,
    slowStartPercent: 5,
    inactiveMonths: 2,
    inactiveRemainingPercent: 10,
    depletedSpentPercent: 90,
    depletedDaysRemaining: 60,
  });
  const setThreshold = (
    key: keyof typeof thresholds,
    raw: string,
  ) => {
    const v = parseFloat(raw);
    if (!isNaN(v) && v >= 0)
      setThresholds((prev: typeof thresholds) => ({ ...prev, [key]: v }));
  };
  const [showThresholds, setShowThresholds] = useState(false);
  const [concerningTab, setConcerningTab] = useState<
    'slowStart' | 'inactive' | 'depleted'
  >('slowStart');

  const { slowStart, inactive, depleted } = useMemo(() => {
    const now = new Date();
    const monthsElapsed = (dateStr: string) => {
      const s = new Date(dateStr);
      return (
        (now.getFullYear() - s.getFullYear()) * 12 +
        (now.getMonth() - s.getMonth())
      );
    };
    const daysUntil = (dateStr: string) => {
      const end = new Date(dateStr);
      end.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return daysBetween(today, end);
    };

    // total_credits = remaining balance; totalAlloc = remaining + spent
    const slowStart = summaries.filter((s: ProjectAccountingSummary) => {
      if (!s.start_date) return false;
      if (monthsElapsed(s.start_date) < thresholds.slowStartMonths) return false;
      const spent = parseCredits(s.total_spend) + parseCredits(s.current_month_spend);
      const totalAlloc = parseCredits(s.total_credits) + spent;
      if (totalAlloc === 0) return false;
      return (spent / totalAlloc) * 100 < thresholds.slowStartPercent;
    });

    const inactive = summaries.filter((s: ProjectAccountingSummary) => {
      if (!s.start_date) return false;
      if (monthsElapsed(s.start_date) < thresholds.inactiveMonths) return false;
      if (parseCredits(s.current_month_spend) >= 0.01) return false;
      const spent = parseCredits(s.total_spend) + parseCredits(s.current_month_spend);
      const remaining = parseCredits(s.total_credits);
      const totalAlloc = remaining + spent;
      if (totalAlloc === 0) return false;
      return (remaining / totalAlloc) * 100 > thresholds.inactiveRemainingPercent;
    });

    const depleted = summaries.filter((s: ProjectAccountingSummary) => {
      if (!s.end_date) return false;
      if (daysUntil(s.end_date) < thresholds.depletedDaysRemaining) return false;
      const spent = parseCredits(s.total_spend) + parseCredits(s.current_month_spend);
      const totalAlloc = parseCredits(s.total_credits) + spent;
      if (totalAlloc === 0) return false;
      return (spent / totalAlloc) * 100 >= thresholds.depletedSpentPercent;
    });

    return { slowStart, inactive, depleted };
  }, [summaries, thresholds]);

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
              Filter selected projects
            </button>
          </div>
        )}

        {loadTriggered && <div className="ms-auto d-flex align-items-center gap-2">
          {(() => {
            const age = customer ? getCacheAge(`alloc-summaries-${customer.uuid}`) : null;
            return age ? (
              <span className="text-muted small">Cached {formatCacheAge(age)}</span>
            ) : null;
          })()}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (customer) {
                clearCached(
                  `alloc-projects-${customer.uuid}`,
                  `alloc-summaries-${customer.uuid}`,
                );
              }
              refetchProjects();
              if (loadTriggered) refetchSummaries();
            }}
          >
            Refresh
          </button>
        </div>}
      </div>

      {/* ── Status ─────────────────────────────────────────────────────── */}
      {loadingStage === 1 && (
        <StageProgress
          stage={1}
          total={2}
          label="Loading project list"
          done={projectProgress.done}
          max={projectProgress.total}
          statusMsg={projectProgress.statusMsg || undefined}
        />
      )}

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

      {/* Load prompt — shown before the user triggers the fetch */}
      {!loadTriggered && !allSummaries && (
        <div className="card mb-4">
          <div className="card-body">
            <p className="mb-1 fw-semibold">Allocation data not yet loaded</p>
            <p className="mb-3 text-muted small">
              Loading computes summaries for every project in this
              organisation and may take 10–15 seconds. You can optionally
              filter to a subset of projects first to speed things up.
            </p>

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

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setLoadTriggered(true)}
            >
              Load data
            </button>
          </div>
        </div>
      )}

      {/* Progress bar while summaries are being fetched */}
      {loadingStage === 2 && (
        <StageProgress
          stage={2}
          total={2}
          label="Loading allocation summaries"
          done={summariesProgress.done}
          max={summariesProgress.total}
          statusMsg={summariesProgress.statusMsg || undefined}
        />
      )}

      {showSlowWarning && (
        <div className="alert alert-warning d-flex align-items-start gap-3 mb-3">
          <div className="flex-grow-1">
            <strong>This is taking a while.</strong>
            <div className="small mt-1">
              To speed things up: use the project search or date filters to load fewer projects.
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

      {loadTriggered && !summariesLoading && !summariesError && summaries.length === 0 && (
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
                onClick={async () => {
                  setExcelProgress({ current: 0, total: 1 });
                  await downloadAllocationExcel(
                    summaries,
                    currencyName,
                    `allocation-summary-${customer?.name ?? 'org'}`,
                    (current, total) => setExcelProgress({ current, total }),
                  );
                  setExcelProgress(null);
                }}
              >
                <FileXlsIcon size={20} />
              </button>
            </Tip>
            {excelProgress && (
              <span className="text-muted small ms-2">
                Preparing Excel — sheet {excelProgress.current} of {excelProgress.total}…
              </span>
            )}
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

      {/* ── Consumption chart ───────────────────────────────────────────── */}
      {summaries.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold d-flex align-items-center gap-3">
            <span>Predicted daily consumption</span>

            {consumptionOptions && (
              <>
                <div className="btn-group btn-group-sm ms-auto" role="group">
                  <button
                    type="button"
                    className={`btn btn-${consumptionGroupBy === 'day' ? 'primary' : 'secondary'}`}
                    onClick={() => setConsumptionGroupBy('day')}
                  >
                    Day
                  </button>
                  <button
                    type="button"
                    className={`btn btn-${consumptionGroupBy === 'month' ? 'primary' : 'secondary'}`}
                    onClick={() => setConsumptionGroupBy('month')}
                  >
                    Month
                  </button>
                </div>

                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn btn-${consumptionChartType === 'bar' ? 'primary' : 'secondary'}`}
                    onClick={() => setConsumptionChartType('bar')}
                  >
                    Bar
                  </button>
                  <button
                    type="button"
                    className={`btn btn-${consumptionChartType === 'line' ? 'primary' : 'secondary'}`}
                    onClick={() => setConsumptionChartType('line')}
                  >
                    Line
                  </button>
                </div>
              </>
            )}

            <Tip id="tip-consumption-excel" label="Download Excel">
              <button
                type="button"
                className="text-btn text-hover-primary"
                onClick={async () => {
                  setExcelProgress({ current: 0, total: 1 });
                  await downloadAllocationExcel(
                    summaries,
                    currencyName,
                    `allocation-summary-${customer?.name ?? 'org'}`,
                    (current, total) => setExcelProgress({ current, total }),
                  );
                  setExcelProgress(null);
                }}
              >
                <FileXlsIcon size={20} />
              </button>
            </Tip>
            {excelProgress && (
              <span className="text-muted small ms-2">
                Preparing Excel — sheet {excelProgress.current} of {excelProgress.total}…
              </span>
            )}
          </div>
          <div className="card-body">
            {consumptionOptions ? (
              <EChart options={consumptionOptions} height="420px" />
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

      {/* ── Concerning projects ─────────────────────────────────────────── */}
      {summaries.length > 0 && (
        <div className="card mb-4">
          <div className="card-header fw-semibold d-flex align-items-center gap-2">
            <span>Concerning Projects</span>
            {slowStart.length + inactive.length + depleted.length > 0 && (
              <span className="badge bg-warning text-dark">
                {new Set<string>([
                  ...slowStart.map((s: ProjectAccountingSummary) => s.project_uuid),
                  ...inactive.map((s: ProjectAccountingSummary) => s.project_uuid),
                  ...depleted.map((s: ProjectAccountingSummary) => s.project_uuid),
                ]).size}
              </span>
            )}
            <button
              type="button"
              className={`btn btn-sm ms-auto btn-${showThresholds ? 'primary' : 'secondary'}`}
              onClick={() => setShowThresholds((v: boolean) => !v)}
            >
              Thresholds
            </button>
          </div>

          <div className="card-body">
            {/* ── Threshold controls ──────────────────────────────────── */}
            {showThresholds && (
              <div className="p-3 mb-3 bg-light rounded small">
                <div className="row g-2">
                  <div className="col-12 d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-semibold" style={{ minWidth: 120 }}>
                      Slow start:
                    </span>
                    <span>started ≥</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: 60 }}
                      min={0}
                      value={thresholds.slowStartMonths}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreshold('slowStartMonths', e.target.value)}
                    />
                    <span>months ago with &lt;</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: 60 }}
                      min={0}
                      max={100}
                      value={thresholds.slowStartPercent}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreshold('slowStartPercent', e.target.value)}
                    />
                    <span>% of allocation spent</span>
                  </div>
                  <div className="col-12 d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-semibold" style={{ minWidth: 120 }}>
                      Inactive:
                    </span>
                    <span>started ≥</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: 60 }}
                      min={0}
                      value={thresholds.inactiveMonths}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreshold('inactiveMonths', e.target.value)}
                    />
                    <span>months ago, no spend this month, &gt;</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: 60 }}
                      min={0}
                      max={100}
                      value={thresholds.inactiveRemainingPercent}
                      onChange={(e) =>
                        setThreshold('inactiveRemainingPercent', e.target.value)
                      }
                    />
                    <span>% remaining</span>
                  </div>
                  <div className="col-12 d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-semibold" style={{ minWidth: 120 }}>
                      Nearly depleted:
                    </span>
                    <span>≥</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: 60 }}
                      min={0}
                      max={100}
                      value={thresholds.depletedSpentPercent}
                      onChange={(e) =>
                        setThreshold('depletedSpentPercent', e.target.value)
                      }
                    />
                    <span>% spent with ≥</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: 70 }}
                      min={0}
                      value={thresholds.depletedDaysRemaining}
                      onChange={(e) =>
                        setThreshold('depletedDaysRemaining', e.target.value)
                      }
                    />
                    <span>days still remaining</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── All clear message ──────────────────────────────────── */}
            {slowStart.length === 0 &&
              inactive.length === 0 &&
              depleted.length === 0 && (
                <p className="text-muted mb-0">
                  ✓ No concerning projects found with the current thresholds.
                </p>
              )}

            {/* ── Tabs ──────────────────────────────────────────────── */}
            {(slowStart.length > 0 ||
              inactive.length > 0 ||
              depleted.length > 0) && (
              <>
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${concerningTab === 'slowStart' ? 'active' : ''}`}
                      onClick={() => setConcerningTab('slowStart')}
                    >
                      Slow start
                      {slowStart.length > 0 && (
                        <span className="badge bg-warning text-dark ms-2">
                          {slowStart.length}
                        </span>
                      )}
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${concerningTab === 'inactive' ? 'active' : ''}`}
                      onClick={() => setConcerningTab('inactive')}
                    >
                      Inactive
                      {inactive.length > 0 && (
                        <span className="badge bg-warning text-dark ms-2">
                          {inactive.length}
                        </span>
                      )}
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${concerningTab === 'depleted' ? 'active' : ''}`}
                      onClick={() => setConcerningTab('depleted')}
                    >
                      Nearly depleted
                      {depleted.length > 0 && (
                        <span className="badge bg-danger ms-2">
                          {depleted.length}
                        </span>
                      )}
                    </button>
                  </li>
                </ul>

                {concerningTab === 'slowStart' && (
                  <div>
                    <p className="text-muted small mb-2">
                      Started ≥ {thresholds.slowStartMonths} month
                      {thresholds.slowStartMonths !== 1 ? 's' : ''} ago but
                      spent less than {thresholds.slowStartPercent}% of their
                      allocation — may not have got going yet.
                    </p>
                    {slowStart.length === 0 ? (
                      <p className="text-muted mb-0">None.</p>
                    ) : (
                      <ul className="mb-0">
                        {slowStart.map((s: ProjectAccountingSummary) => {
                          const spent =
                            parseCredits(s.total_spend) +
                            parseCredits(s.current_month_spend);
                          const totalAlloc =
                            parseCredits(s.total_credits) + spent;
                          const pct = (
                            (spent / (totalAlloc || 1)) *
                            100
                          ).toFixed(1);
                          return (
                            <li key={s.project_uuid} className="mb-1">
                              <a
                                href={`/projects/${s.project_uuid}/`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.project_name}
                              </a>
                              {' — started '}
                              {s.start_date}
                              {', '}
                              {pct}% spent ({fmtCredits(spent)} /{' '}
                              {fmtCredits(totalAlloc)} {currencyName})
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {concerningTab === 'inactive' && (
                  <div>
                    <p className="text-muted small mb-2">
                      Started ≥ {thresholds.inactiveMonths} month
                      {thresholds.inactiveMonths !== 1 ? 's' : ''} ago, no
                      spend recorded this month, and more than{' '}
                      {thresholds.inactiveRemainingPercent}% of allocation
                      still remaining. Note: only the current month's activity
                      is visible here.
                    </p>
                    {inactive.length === 0 ? (
                      <p className="text-muted mb-0">None.</p>
                    ) : (
                      <ul className="mb-0">
                        {inactive.map((s: ProjectAccountingSummary) => {
                          const spent =
                            parseCredits(s.total_spend) +
                            parseCredits(s.current_month_spend);
                          const remaining = parseCredits(s.total_credits);
                          const totalAlloc = remaining + spent;
                          const pct = (
                            (remaining / (totalAlloc || 1)) *
                            100
                          ).toFixed(1);
                          return (
                            <li key={s.project_uuid} className="mb-1">
                              <a
                                href={`/projects/${s.project_uuid}/`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.project_name}
                              </a>
                              {' — started '}
                              {s.start_date}
                              {', no spend this month, '}
                              {pct}% remaining ({fmtCredits(remaining)} /{' '}
                              {fmtCredits(totalAlloc)} {currencyName})
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {concerningTab === 'depleted' && (
                  <div>
                    <p className="text-muted small mb-2">
                      At least {thresholds.depletedSpentPercent}% of allocation
                      spent, but still ≥ {thresholds.depletedDaysRemaining}{' '}
                      days until the project ends — may need a top-up.
                    </p>
                    {depleted.length === 0 ? (
                      <p className="text-muted mb-0">None.</p>
                    ) : (
                      <ul className="mb-0">
                        {depleted.map((s: ProjectAccountingSummary) => {
                          const spent =
                            parseCredits(s.total_spend) +
                            parseCredits(s.current_month_spend);
                          const totalAlloc =
                            parseCredits(s.total_credits) + spent;
                          const spentPct = (
                            (spent / (totalAlloc || 1)) *
                            100
                          ).toFixed(1);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const end = new Date(s.end_date!);
                          end.setHours(0, 0, 0, 0);
                          const days = daysBetween(today, end);
                          return (
                            <li key={s.project_uuid} className="mb-1">
                              <a
                                href={`/projects/${s.project_uuid}/`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.project_name}
                              </a>
                              {' — '}
                              {spentPct}% spent ({fmtCredits(spent)} /{' '}
                              {fmtCredits(totalAlloc)} {currencyName}), ends{' '}
                              {s.end_date} ({days} days remaining)
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
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
