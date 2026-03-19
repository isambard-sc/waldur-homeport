/**
 * Pure functions that build EChartsOption objects from ProjectUsageReport data.
 * No React, no API calls — accepts wrapper class instances and returns options.
 */

import type { EChartsOption } from 'echarts';

import { ProjectUsageReport } from './ProjectUsageReport';
import { secondsToHours } from './storage';

/** Colour palette */
const PALETTE = [
  '#003366',
  '#006699',
  '#23c6c8',
  '#1c84c6',
  '#2ecc71',
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#9b59b6',
  '#1abc9c',
  '#e91e63',
  '#ff5722',
];

export type UsageMetric = 'usage' | 'jobs' | 'avg_wait';
export type UsageComponent = 'total' | string;
export type GroupBy = 'day' | 'month';

export interface NameMaps {
  offering?: Record<string, string>;
  project?: Record<string, string>;
  user?: Record<string, string>;
}

// ── Label helpers ──────────────────────────────────────────────────────────────

/** Strip the project suffix from a local username: "chris.aiproject" → "chris" */
const shortName = (s: string) => s.split('.')[0];

/** Truncate a string at the last word boundary ≤ maxLen characters */
export function truncateLabel(s: string, maxLen = 32): string {
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 4 ? cut.slice(0, lastSpace) : cut) + '…';
}

// ── Tooltip helpers ────────────────────────────────────────────────────────────

const MAX_TOOLTIP_ITEMS = 15;
const MAX_PIE_SLICES = 15;

const tooltipDot = (color: string) =>
  `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:4px"></span>`;

/**
 * Build tooltip rows from axis params, sorted largest-first.
 * Shows at most MAX_TOOLTIP_ITEMS entries with an "others" summary.
 * Returns both the rows HTML and the grand total.
 */
export function buildTooltipRows(
  params: any[],
  fmtVal: (v: number) => string,
): { rows: string; total: number } {
  const active = (params as any[]).filter((p) => (p.value as number) > 0);
  active.sort((a, b) => (b.value as number) - (a.value as number));
  const shown = active.slice(0, MAX_TOOLTIP_ITEMS);
  const rest = active.slice(MAX_TOOLTIP_ITEMS);
  const othersTotal = rest.reduce((s: number, p: any) => s + (p.value as number), 0);
  const total = active.reduce((s: number, p: any) => s + (p.value as number), 0);
  const rowLines = [
    ...shown.map(
      (p: any) =>
        `${tooltipDot(p.color)}${p.seriesName}: <b>${fmtVal(p.value as number)}</b>`,
    ),
    ...(rest.length > 0
      ? [
          `<i style="color:#888">…${rest.length} others: <b>${fmtVal(othersTotal)}</b></i>`,
        ]
      : []),
  ];
  return { rows: rowLines.join('<br/>'), total };
}

/** Top-N pie data: sort by value desc, merge tail into "Others (N)" */
export function topNPieData(
  data: Array<{ name: string; value: number; itemStyle: { color: string } }>,
): Array<{ name: string; value: number; itemStyle: { color: string } }> {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  if (sorted.length <= MAX_PIE_SLICES) return sorted;
  const shown = sorted.slice(0, MAX_PIE_SLICES);
  const rest = sorted.slice(MAX_PIE_SLICES);
  return [
    ...shown,
    {
      name: `Others (${rest.length})`,
      value: rest.reduce((s, d) => s + d.value, 0),
      itemStyle: { color: '#bbb' },
    },
  ];
}

// ── X-axis range helper ────────────────────────────────────────────────────────

/**
 * Compute dataZoom start/end percentages so the chart shows only the range
 * that contains non-zero data (hides leading/trailing empty periods).
 */
export function computeDataZoomRange(
  labels: string[],
  seriesData: (number | null)[][],
): { start: number; end: number } {
  let firstIdx = labels.length;
  let lastIdx = -1;
  for (const data of seriesData) {
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      if (v !== null && v !== undefined && (v as number) > 0) {
        if (i < firstIdx) firstIdx = i;
        if (i > lastIdx) lastIdx = i;
      }
    }
  }
  if (firstIdx > lastIdx || labels.length === 0) return { start: 0, end: 100 };
  const start = Math.max(0, Math.floor((firstIdx / labels.length) * 100));
  const end = Math.min(100, Math.ceil(((lastIdx + 1) / labels.length) * 100));
  return { start, end };
}

// ── Aggregation helpers ────────────────────────────────────────────────────────

function computeLabels(dates: string[], groupBy: GroupBy): string[] {
  if (groupBy === 'month') {
    return [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
  }
  return dates;
}

function sumOverLabel(
  dates: string[],
  label: string,
  groupBy: GroupBy,
  getValue: (d: string) => number,
): number {
  if (groupBy === 'month') {
    return dates
      .filter((d) => d.startsWith(label))
      .reduce((s, d) => s + getValue(d), 0);
  }
  return getValue(label);
}

function avgWaitOverLabel(
  dates: string[],
  label: string,
  groupBy: GroupBy,
  getTotalWaitSec: (d: string) => number,
  getJobs: (d: string) => number,
): number | null {
  const relevantDates =
    groupBy === 'month' ? dates.filter((d) => d.startsWith(label)) : [label];
  const totalJobs = relevantDates.reduce((s, d) => s + getJobs(d), 0);
  const totalWait = relevantDates.reduce((s, d) => s + getTotalWaitSec(d), 0);
  return totalJobs > 0 ? Math.round(totalWait / totalJobs / 60) : null;
}

// ── Shared base config ────────────────────────────────────────────────────────

function baseTimeseriesConfig(
  labels: string[],
  groupBy: GroupBy,
  yName: string,
  yFormatter: string,
  dataZoomRange: { start: number; end: number } = { start: 0, end: 100 },
) {
  return {
    toolbox: {
      right: 10,
      feature: {
        magicType: {
          type: ['bar', 'line'],
          title: { bar: 'Bar chart', line: 'Line chart' },
        },
        saveAsImage: { title: 'Save image' },
      },
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        bottom: 10,
        height: 40,
        start: dataZoomRange.start,
        end: dataZoomRange.end,
      },
    ],
    grid: { bottom: 130 },
    xAxis: {
      type: 'category' as const,
      data: labels,
      axisLabel: {
        rotate: 30,
        formatter:
          groupBy === 'month' ? undefined : (v: string) => v.slice(5),
      },
    },
    yAxis: {
      type: 'value' as const,
      name: yName,
      axisLabel: { formatter: yFormatter },
    },
  };
}

// ── Group reports by project ──────────────────────────────────────────────────

function groupByProject(reports: ProjectUsageReport[]): ProjectUsageReport[] {
  const map = new Map<string, ProjectUsageReport[]>();
  for (const r of reports) {
    const existing = map.get(r.project) ?? [];
    map.set(r.project, [...existing, r]);
  }
  return [...map.values()].map((group) =>
    group.length === 1 ? group[0] : ProjectUsageReport.combine(group),
  );
}

// ── Resolve display names ─────────────────────────────────────────────────────

function resolveUserName(
  u: string,
  report: ProjectUsageReport,
  fullNames: boolean,
  nameMaps?: NameMaps,
): string {
  if (nameMaps?.user) {
    const uid = report.localToIdentifier[u];
    if (uid && nameMaps.user[uid]) return truncateLabel(nameMaps.user[uid]);
  }
  return truncateLabel(fullNames ? u : shortName(u));
}

function resolveProjectName(projId: string, nameMaps?: NameMaps): string {
  return truncateLabel(nameMaps?.project?.[projId] ?? projId);
}

// ─── Usage (hours) ────────────────────────────────────────────────────────────

export function buildTimeseriesOptions(
  report: ProjectUsageReport,
  component: UsageComponent = 'total',
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const dates = report.dates;
  const labels = computeLabels(dates, groupBy);
  const users = report.localUsers();
  const displayNames = users.map((u) => resolveUserName(u, report, fullNames, nameMaps));

  const getHoursForDate = (user: string, date: string): number => {
    const daily = report.getReport(date);
    if (!daily) return 0;
    if (component === 'total') {
      return secondsToHours(daily.usageForUser(user).seconds);
    }
    return secondsToHours(daily.componentUsageForUser(component, user).seconds);
  };

  const yLabel =
    component === 'total'
      ? 'Usage (hours)'
      : `${component.charAt(0).toUpperCase()}${component.slice(1)} (hours)`;

  const seriesData = users.map((user) =>
    labels.map((label) =>
      sumOverLabel(dates, label, groupBy, (d) => getHoursForDate(user, d)),
    ),
  );
  const zoom = computeDataZoomRange(labels, seriesData);
  const base = baseTimeseriesConfig(labels, groupBy, yLabel, '{value} h', zoom);

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const { rows, total } = buildTooltipRows(params, (v) => `${v.toFixed(2)} h`);
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${total.toFixed(2)} h</b>`;
      },
    },
    legend: { data: displayNames, type: 'scroll', bottom: 60 },
    ...base,
    series: users.map((_user, i) => ({
      name: displayNames[i],
      type: 'bar',
      stack: 'usage',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: seriesData[i],
    })),
  };
}

export function buildPieOptions(
  report: ProjectUsageReport,
  component: UsageComponent = 'total',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const rawData = users
    .map((user, i) => {
      const hours =
        component === 'total'
          ? secondsToHours(report.usageForUser(user).seconds)
          : secondsToHours(report.componentUsageForUser(component, user).seconds);
      return {
        name: resolveUserName(user, report, fullNames, nameMaps),
        value: hours,
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d) => d.value > 0);

  const data = topNPieData(rawData);
  const label = component === 'total' ? 'Total usage' : `${component} usage`;

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} h ({d}%)' },
    legend: { orient: 'vertical', right: 10, type: 'scroll' },
    series: [
      {
        name: label,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        data,
      },
    ],
  };
}

// ─── Usage by project ─────────────────────────────────────────────────────────

export function buildProjectTimeseriesOptions(
  reports: ProjectUsageReport[],
  component: UsageComponent = 'total',
  groupBy: GroupBy = 'day',
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const allDates = [...new Set(projectReports.flatMap((r) => r.dates))].sort();
  const labels = computeLabels(allDates, groupBy);

  const getTotalHoursForDate = (r: ProjectUsageReport, date: string): number => {
    const daily = r.getReport(date);
    if (!daily) return 0;
    if (component === 'total') return secondsToHours(daily.totalUsage().seconds);
    return r
      .localUsers()
      .reduce(
        (s, user) => s + secondsToHours(daily.componentUsageForUser(component, user).seconds),
        0,
      );
  };

  const yLabel =
    component === 'total'
      ? 'Usage (hours)'
      : `${component.charAt(0).toUpperCase()}${component.slice(1)} (hours)`;

  const seriesData = projectReports.map((r) =>
    labels.map((label) =>
      sumOverLabel(allDates, label, groupBy, (d) => getTotalHoursForDate(r, d)),
    ),
  );
  const zoom = computeDataZoomRange(labels, seriesData);
  const base = baseTimeseriesConfig(labels, groupBy, yLabel, '{value} h', zoom);
  const projNames = projectReports.map((r) => resolveProjectName(r.project, nameMaps));

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const { rows, total } = buildTooltipRows(params, (v) => `${v.toFixed(2)} h`);
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${total.toFixed(2)} h</b>`;
      },
    },
    legend: { data: projNames, type: 'scroll', bottom: 60 },
    ...base,
    series: projectReports.map((_r, i) => ({
      name: projNames[i],
      type: 'bar',
      stack: 'usage',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: seriesData[i],
    })),
  };
}

export function buildProjectPieOptions(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);

  const rawData = projectReports
    .map((r, i) => ({
      name: resolveProjectName(r.project, nameMaps),
      value: r.totalUsageHours(),
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }))
    .filter((d) => d.value > 0);

  const data = topNPieData(rawData);

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} h ({d}%)' },
    legend: { orient: 'vertical', right: 10, type: 'scroll' },
    series: [
      {
        name: 'Usage by project',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        data,
      },
    ],
  };
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export function buildJobsTimeseriesOptions(
  report: ProjectUsageReport,
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const dates = report.dates;
  const labels = computeLabels(dates, groupBy);
  const users = report.localUsers();
  const displayNames = users.map((u) => resolveUserName(u, report, fullNames, nameMaps));

  const seriesData = users.map((user) =>
    labels.map((label) =>
      sumOverLabel(dates, label, groupBy, (d) => report.getReport(d)?.userJobCounts[user] ?? 0),
    ),
  );
  const zoom = computeDataZoomRange(labels, seriesData);
  const base = baseTimeseriesConfig(labels, groupBy, 'Jobs', '{value}', zoom);

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const { rows, total } = buildTooltipRows(params, (v) => String(Math.round(v)));
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${Math.round(total)}</b>`;
      },
    },
    legend: { data: displayNames, type: 'scroll', bottom: 60 },
    ...base,
    series: users.map((_user, i) => ({
      name: displayNames[i],
      type: 'bar',
      stack: 'jobs',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: seriesData[i],
    })),
  };
}

export function buildJobsPieOptions(
  report: ProjectUsageReport,
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const rawData = users
    .map((user, i) => {
      const total = report.dailyReports().reduce((s, d) => s + (d.userJobCounts[user] ?? 0), 0);
      return {
        name: resolveUserName(user, report, fullNames, nameMaps),
        value: total,
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d) => d.value > 0);

  const data = topNPieData(rawData);

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} jobs ({d}%)' },
    legend: { orient: 'vertical', right: 10, type: 'scroll' },
    series: [
      {
        name: 'Jobs',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        data,
      },
    ],
  };
}

// ─── Jobs by project ──────────────────────────────────────────────────────────

export function buildProjectJobsTimeseriesOptions(
  reports: ProjectUsageReport[],
  groupBy: GroupBy = 'day',
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const allDates = [...new Set(projectReports.flatMap((r) => r.dates))].sort();
  const labels = computeLabels(allDates, groupBy);
  const projNames = projectReports.map((r) => resolveProjectName(r.project, nameMaps));

  const seriesData = projectReports.map((r) =>
    labels.map((label) =>
      sumOverLabel(allDates, label, groupBy, (d) => r.getReport(d)?.numJobs ?? 0),
    ),
  );
  const zoom = computeDataZoomRange(labels, seriesData);
  const base = baseTimeseriesConfig(labels, groupBy, 'Jobs', '{value}', zoom);

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const { rows, total } = buildTooltipRows(params, (v) => String(Math.round(v)));
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${Math.round(total)}</b>`;
      },
    },
    legend: { data: projNames, type: 'scroll', bottom: 60 },
    ...base,
    series: projectReports.map((_r, i) => ({
      name: projNames[i],
      type: 'bar',
      stack: 'jobs',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: seriesData[i],
    })),
  };
}

export function buildProjectJobsPieOptions(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);

  const rawData = projectReports
    .map((r, i) => ({
      name: resolveProjectName(r.project, nameMaps),
      value: r.dailyReports().reduce((s, d) => s + d.numJobs, 0),
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }))
    .filter((d) => d.value > 0);

  const data = topNPieData(rawData);

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} jobs ({d}%)' },
    legend: { orient: 'vertical', right: 10, type: 'scroll' },
    series: [
      {
        name: 'Jobs by project',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        data,
      },
    ],
  };
}

// ─── Average wait ─────────────────────────────────────────────────────────────

export function buildAvgWaitTimeseriesOptions(
  report: ProjectUsageReport,
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const dates = report.dates;
  const labels = computeLabels(dates, groupBy);
  const users = report.localUsers();
  const displayNames = users.map((u) => resolveUserName(u, report, fullNames, nameMaps));

  const userSeriesData = users.map((user) =>
    labels.map((label) =>
      avgWaitOverLabel(
        dates,
        label,
        groupBy,
        (d) => report.getReport(d)?.userWaitSeconds[user] ?? 0,
        (d) => report.getReport(d)?.userJobCounts[user] ?? 0,
      ),
    ),
  );
  const totalSeriesData = labels.map((label) =>
    avgWaitOverLabel(
      dates,
      label,
      groupBy,
      (d) => report.getReport(d)?.totalWaitSeconds ?? 0,
      (d) => report.getReport(d)?.numJobs ?? 0,
    ),
  );

  const zoom = computeDataZoomRange(
    labels,
    [...userSeriesData, totalSeriesData].map((d) => d.map((v) => v ?? 0)),
  );
  const base = baseTimeseriesConfig(labels, groupBy, 'Avg wait (min)', '{value} min', zoom);

  const userSeries = users.map((_user, i) => ({
    name: displayNames[i],
    type: 'line' as const,
    connectNulls: false,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: userSeriesData[i],
  }));

  const totalSeries = {
    name: 'Total avg',
    type: 'line' as const,
    lineStyle: { type: 'dashed' as const, width: 2 },
    itemStyle: { color: '#999' },
    connectNulls: false,
    data: totalSeriesData,
  };

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const active = (params as any[]).filter(
          (p) => p.value !== null && p.value !== undefined,
        );
        active.sort((a, b) => (b.value as number) - (a.value as number));
        const shown = active.slice(0, MAX_TOOLTIP_ITEMS);
        const rest = active.slice(MAX_TOOLTIP_ITEMS);
        const rowLines = [
          ...shown.map(
            (p: any) =>
              `${tooltipDot(p.color)}${p.seriesName}: <b>${p.value} min</b>`,
          ),
          ...(rest.length > 0
            ? [`<i style="color:#888">…${rest.length} others</i>`]
            : []),
        ];
        return `<b>${label}</b><br/>${rowLines.join('<br/>')}`;
      },
    },
    legend: { data: [...displayNames, 'Total avg'], type: 'scroll', bottom: 60 },
    ...base,
    toolbox: { right: 10, feature: { saveAsImage: { title: 'Save image' } } },
    series: [...userSeries, totalSeries],
  };
}

export function buildAvgWaitPieOptions(
  report: ProjectUsageReport,
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const rawData = users
    .map((user, i) => {
      const totalJobs = report.dailyReports().reduce((s, d) => s + (d.userJobCounts[user] ?? 0), 0);
      const totalWait = report.dailyReports().reduce((s, d) => s + (d.userWaitSeconds[user] ?? 0), 0);
      if (totalJobs === 0) return null;
      return {
        name: resolveUserName(user, report, fullNames, nameMaps),
        value: Math.round(totalWait / totalJobs / 60),
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null && d.value > 0);

  const data = topNPieData(rawData);

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} min avg ({d}%)' },
    legend: { orient: 'vertical', right: 10, type: 'scroll' },
    series: [
      {
        name: 'Avg wait',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{c} min' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        data,
      },
    ],
  };
}

// ─── Avg wait by project ──────────────────────────────────────────────────────

export function buildProjectAvgWaitTimeseriesOptions(
  reports: ProjectUsageReport[],
  groupBy: GroupBy = 'day',
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const allDates = [...new Set(projectReports.flatMap((r) => r.dates))].sort();
  const labels = computeLabels(allDates, groupBy);
  const projNames = projectReports.map((r) => resolveProjectName(r.project, nameMaps));

  const seriesData = projectReports.map((r) =>
    labels.map((label) =>
      avgWaitOverLabel(
        allDates,
        label,
        groupBy,
        (d) => r.getReport(d)?.totalWaitSeconds ?? 0,
        (d) => r.getReport(d)?.numJobs ?? 0,
      ),
    ),
  );
  const zoom = computeDataZoomRange(labels, seriesData.map((d) => d.map((v) => v ?? 0)));
  const base = baseTimeseriesConfig(labels, groupBy, 'Avg wait (min)', '{value} min', zoom);

  const series = projectReports.map((_r, i) => ({
    name: projNames[i],
    type: 'line' as const,
    connectNulls: false,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: seriesData[i],
  }));

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const active = (params as any[]).filter(
          (p) => p.value !== null && p.value !== undefined,
        );
        active.sort((a, b) => (b.value as number) - (a.value as number));
        const shown = active.slice(0, MAX_TOOLTIP_ITEMS);
        const rest = active.slice(MAX_TOOLTIP_ITEMS);
        const rowLines = [
          ...shown.map(
            (p: any) =>
              `${tooltipDot(p.color)}${p.seriesName}: <b>${p.value} min</b>`,
          ),
          ...(rest.length > 0 ? [`<i style="color:#888">…${rest.length} others</i>`] : []),
        ];
        return `<b>${label}</b><br/>${rowLines.join('<br/>')}`;
      },
    },
    legend: { data: projNames, type: 'scroll', bottom: 60 },
    ...base,
    toolbox: { right: 10, feature: { saveAsImage: { title: 'Save image' } } },
    series,
  };
}

export function buildProjectAvgWaitPieOptions(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);

  const rawData = projectReports
    .map((r, i) => {
      const totalJobs = r.dailyReports().reduce((s, d) => s + d.numJobs, 0);
      const totalWait = r.dailyReports().reduce((s, d) => s + d.totalWaitSeconds, 0);
      if (totalJobs === 0) return null;
      return {
        name: resolveProjectName(r.project, nameMaps),
        value: Math.round(totalWait / totalJobs / 60),
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null && d.value > 0);

  const data = topNPieData(rawData);

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} min avg ({d}%)' },
    legend: { orient: 'vertical', right: 10, type: 'scroll' },
    series: [
      {
        name: 'Avg wait by project',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: { show: true, formatter: '{b}\n{c} min' },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        data,
      },
    ],
  };
}
