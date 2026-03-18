/**
 * Pure functions that build EChartsOption objects from ProjectUsageReport data.
 * No React, no API calls — accepts wrapper class instances and returns options.
 *
 * Grouping dimensions:
 *   groupBy  — 'day' (default) | 'month'  aggregates daily bars into monthly bars
 *   groupMode — the Vis component decides whether to call buildProject* functions
 *               (one series per project) or the regular per-user functions.
 *
 * Three metrics, two views each:
 *   buildTimeseriesOptions / buildPieOptions  — CPU-hours (or component hours)
 *   buildJobsTimeseriesOptions / buildJobsPieOptions  — job counts per user
 *   buildAvgWaitTimeseriesOptions / buildAvgWaitPieOptions  — avg scheduler wait
 *
 * Project-level equivalents (one series per project, not per user):
 *   buildProjectTimeseriesOptions / buildProjectPieOptions
 *   buildProjectJobsTimeseriesOptions / buildProjectJobsPieOptions
 *   buildProjectAvgWaitTimeseriesOptions / buildProjectAvgWaitPieOptions
 */

import type { EChartsOption } from 'echarts';

import { ProjectUsageReport } from './ProjectUsageReport';
import { secondsToHours } from './storage';

/** Colour palette — matches the one used in openportal/details/constants.ts */
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
  offering?: Record<string, string>; // resource identifier → offering name
  project?: Record<string, string>;  // project identifier → project name
  user?: Record<string, string>;     // UserIdentifier → full_name
}

/** Strip the project suffix from a local username: "chris.aiproject" → "chris" */
const shortName = (s: string) => s.split('.')[0];

// ── Aggregation helpers ───────────────────────────────────────────────────────

/** Derive x-axis labels from raw dates according to the groupBy mode. */
function computeLabels(dates: string[], groupBy: GroupBy): string[] {
  if (groupBy === 'month') {
    return [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
  }
  return dates;
}

/** Sum a per-date value over all dates within a label (day or month bucket). */
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

/**
 * Weighted-average wait time (minutes) over a label bucket.
 * Returns null when there are zero jobs (gap in line chart).
 */
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
        start: 0,
        end: 100,
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

/**
 * Combine multiple monthly reports for the same project into one per project.
 * Preserves project separation so "by project" charts can show one series each.
 */
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

// ─── Usage (hours) ────────────────────────────────────────────────────────────

/**
 * Stacked bar chart: daily or monthly usage per user.
 */
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
  const displayNames = users.map((u) => {
    if (nameMaps?.user) {
      const uid = report.localToIdentifier[u];
      if (uid && nameMaps.user[uid]) return nameMaps.user[uid];
    }
    return fullNames ? u : shortName(u);
  });

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

  const base = baseTimeseriesConfig(labels, groupBy, yLabel, '{value} h');

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const total = (params as any[]).reduce(
          (s: number, p: any) => s + (p.value as number),
          0,
        );
        const rows = (params as any[])
          .filter((p: any) => (p.value as number) > 0)
          .map(
            (p: any) =>
              `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${(p.value as number).toFixed(2)} h</b>`,
          )
          .join('<br/>');
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${total.toFixed(2)} h</b>`;
      },
    },
    legend: { data: displayNames, type: 'scroll', bottom: 60 },
    ...base,
    series: users.map((user, i) => ({
      name: displayNames[i],
      type: 'bar',
      stack: 'usage',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: labels.map((label) =>
        sumOverLabel(dates, label, groupBy, (d) => getHoursForDate(user, d)),
      ),
    })),
  };
}

/**
 * Donut pie chart: total usage per user across the selected period.
 */
export function buildPieOptions(
  report: ProjectUsageReport,
  component: UsageComponent = 'total',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const data = users
    .map((user, i) => {
      const hours =
        component === 'total'
          ? secondsToHours(report.usageForUser(user).seconds)
          : secondsToHours(
              report.componentUsageForUser(component, user).seconds,
            );
      let displayName: string;
      if (nameMaps?.user) {
        const uid = report.localToIdentifier[user];
        displayName = (uid && nameMaps.user[uid]) ? nameMaps.user[uid] : (fullNames ? user : shortName(user));
      } else {
        displayName = fullNames ? user : shortName(user);
      }
      return {
        name: displayName,
        value: hours,
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d) => d.value > 0);

  const label =
    component === 'total' ? 'Total usage' : `${component} usage`;

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
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}

// ─── Usage by project ─────────────────────────────────────────────────────────

/**
 * Stacked bar chart: daily or monthly usage, one series per project.
 * Used when multiple projects are present and the user selects "By project".
 */
export function buildProjectTimeseriesOptions(
  reports: ProjectUsageReport[],
  component: UsageComponent = 'total',
  groupBy: GroupBy = 'day',
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const resolveProject = (projId: string) => nameMaps?.project?.[projId] ?? projId;
  const allDates = [
    ...new Set(projectReports.flatMap((r) => r.dates)),
  ].sort();
  const labels = computeLabels(allDates, groupBy);

  const getTotalHoursForDate = (
    r: ProjectUsageReport,
    date: string,
  ): number => {
    const daily = r.getReport(date);
    if (!daily) return 0;
    if (component === 'total') {
      return secondsToHours(daily.totalUsage().seconds);
    }
    return r
      .localUsers()
      .reduce(
        (s, user) =>
          s +
          secondsToHours(
            daily.componentUsageForUser(component, user).seconds,
          ),
        0,
      );
  };

  const yLabel =
    component === 'total'
      ? 'Usage (hours)'
      : `${component.charAt(0).toUpperCase()}${component.slice(1)} (hours)`;

  const base = baseTimeseriesConfig(labels, groupBy, yLabel, '{value} h');

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const total = (params as any[]).reduce(
          (s: number, p: any) => s + (p.value as number),
          0,
        );
        const rows = (params as any[])
          .filter((p: any) => (p.value as number) > 0)
          .map(
            (p: any) =>
              `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${(p.value as number).toFixed(2)} h</b>`,
          )
          .join('<br/>');
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${total.toFixed(2)} h</b>`;
      },
    },
    legend: { data: projectReports.map((r) => resolveProject(r.project)), type: 'scroll', bottom: 60 },
    ...base,
    series: projectReports.map((r, i) => ({
      name: resolveProject(r.project),
      type: 'bar',
      stack: 'usage',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: labels.map((label) =>
        sumOverLabel(allDates, label, groupBy, (d) =>
          getTotalHoursForDate(r, d),
        ),
      ),
    })),
  };
}

/**
 * Donut pie: total usage per project.
 */
export function buildProjectPieOptions(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const resolveProject = (projId: string) => nameMaps?.project?.[projId] ?? projId;

  const data = projectReports
    .map((r, i) => ({
      name: resolveProject(r.project),
      value: r.totalUsageHours(),
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }))
    .filter((d) => d.value > 0);

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
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

/**
 * Stacked bar chart: number of jobs per user per day/month.
 */
export function buildJobsTimeseriesOptions(
  report: ProjectUsageReport,
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const dates = report.dates;
  const labels = computeLabels(dates, groupBy);
  const users = report.localUsers();
  const displayNames = users.map((u) => {
    if (nameMaps?.user) {
      const uid = report.localToIdentifier[u];
      if (uid && nameMaps.user[uid]) return nameMaps.user[uid];
    }
    return fullNames ? u : shortName(u);
  });
  const base = baseTimeseriesConfig(labels, groupBy, 'Jobs', '{value}');

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const total = (params as any[]).reduce(
          (s, p) => s + (p.value as number),
          0,
        );
        const rows = (params as any[])
          .filter((p) => (p.value as number) > 0)
          .map(
            (p) =>
              `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${p.value}</b>`,
          )
          .join('<br/>');
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${total}</b>`;
      },
    },
    legend: { data: displayNames, type: 'scroll', bottom: 60 },
    ...base,
    series: users.map((user, i) => ({
      name: displayNames[i],
      type: 'bar',
      stack: 'jobs',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: labels.map((label) =>
        sumOverLabel(
          dates,
          label,
          groupBy,
          (d) => report.getReport(d)?.userJobCounts[user] ?? 0,
        ),
      ),
    })),
  };
}

/**
 * Donut pie chart: total jobs per user.
 */
export function buildJobsPieOptions(
  report: ProjectUsageReport,
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const data = users
    .map((user, i) => {
      const total = report
        .dailyReports()
        .reduce((s, d) => s + (d.userJobCounts[user] ?? 0), 0);
      let displayName: string;
      if (nameMaps?.user) {
        const uid = report.localToIdentifier[user];
        displayName = (uid && nameMaps.user[uid]) ? nameMaps.user[uid] : (fullNames ? user : shortName(user));
      } else {
        displayName = fullNames ? user : shortName(user);
      }
      return {
        name: displayName,
        value: total,
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d) => d.value > 0);

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
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
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
  const resolveProject = (projId: string) => nameMaps?.project?.[projId] ?? projId;
  const allDates = [
    ...new Set(projectReports.flatMap((r) => r.dates)),
  ].sort();
  const labels = computeLabels(allDates, groupBy);
  const base = baseTimeseriesConfig(labels, groupBy, 'Jobs', '{value}');

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const total = (params as any[]).reduce(
          (s, p) => s + (p.value as number),
          0,
        );
        const rows = (params as any[])
          .filter((p) => (p.value as number) > 0)
          .map(
            (p) =>
              `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${p.value}</b>`,
          )
          .join('<br/>');
        return `<b>${label}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${total}</b>`;
      },
    },
    legend: { data: projectReports.map((r) => resolveProject(r.project)), type: 'scroll', bottom: 60 },
    ...base,
    series: projectReports.map((r, i) => ({
      name: resolveProject(r.project),
      type: 'bar',
      stack: 'jobs',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: labels.map((label) =>
        sumOverLabel(
          allDates,
          label,
          groupBy,
          (d) => r.getReport(d)?.numJobs ?? 0,
        ),
      ),
    })),
  };
}

export function buildProjectJobsPieOptions(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): EChartsOption {
  const projectReports = groupByProject(reports);
  const resolveProject = (projId: string) => nameMaps?.project?.[projId] ?? projId;

  const data = projectReports
    .map((r, i) => ({
      name: resolveProject(r.project),
      value: r.dailyReports().reduce((s, d) => s + d.numJobs, 0),
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }))
    .filter((d) => d.value > 0);

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
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}

// ─── Average wait ─────────────────────────────────────────────────────────────

/**
 * Line chart: average scheduler wait per user per day/month (minutes).
 */
export function buildAvgWaitTimeseriesOptions(
  report: ProjectUsageReport,
  groupBy: GroupBy = 'day',
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const dates = report.dates;
  const labels = computeLabels(dates, groupBy);
  const users = report.localUsers();
  const displayNames = users.map((u) => {
    if (nameMaps?.user) {
      const uid = report.localToIdentifier[u];
      if (uid && nameMaps.user[uid]) return nameMaps.user[uid];
    }
    return fullNames ? u : shortName(u);
  });
  const base = baseTimeseriesConfig(
    labels,
    groupBy,
    'Avg wait (min)',
    '{value} min',
  );

  const userSeries = users.map((user, i) => ({
    name: displayNames[i],
    type: 'line' as const,
    connectNulls: false,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: labels.map((label) =>
      avgWaitOverLabel(
        dates,
        label,
        groupBy,
        (d) => report.getReport(d)?.userWaitSeconds[user] ?? 0,
        (d) => report.getReport(d)?.userJobCounts[user] ?? 0,
      ),
    ),
  }));

  const totalSeries = {
    name: 'Total avg',
    type: 'line' as const,
    lineStyle: { type: 'dashed' as const, width: 2 },
    itemStyle: { color: '#999' },
    connectNulls: false,
    data: labels.map((label) =>
      avgWaitOverLabel(
        dates,
        label,
        groupBy,
        (d) => report.getReport(d)?.totalWaitSeconds ?? 0,
        (d) => report.getReport(d)?.numJobs ?? 0,
      ),
    ),
  };

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const rows = (params as any[])
          .filter((p) => p.value !== null && p.value !== undefined)
          .map(
            (p) =>
              `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${p.value} min</b>`,
          )
          .join('<br/>');
        return `<b>${label}</b><br/>${rows}`;
      },
    },
    legend: { data: [...displayNames, 'Total avg'], type: 'scroll', bottom: 60 },
    ...base,
    toolbox: {
      right: 10,
      feature: { saveAsImage: { title: 'Save image' } },
    },
    series: [...userSeries, totalSeries],
  };
}

/**
 * Donut pie: average wait per user across all days.
 */
export function buildAvgWaitPieOptions(
  report: ProjectUsageReport,
  fullNames = false,
  nameMaps?: NameMaps,
): EChartsOption {
  const users = report.localUsers();

  const data = users
    .map((user, i) => {
      const totalJobs = report
        .dailyReports()
        .reduce((s, d) => s + (d.userJobCounts[user] ?? 0), 0);
      const totalWait = report
        .dailyReports()
        .reduce((s, d) => s + (d.userWaitSeconds[user] ?? 0), 0);
      if (totalJobs === 0) return null;
      let displayName: string;
      if (nameMaps?.user) {
        const uid = report.localToIdentifier[user];
        displayName = (uid && nameMaps.user[uid]) ? nameMaps.user[uid] : (fullNames ? user : shortName(user));
      } else {
        displayName = fullNames ? user : shortName(user);
      }
      return {
        name: displayName,
        value: Math.round(totalWait / totalJobs / 60),
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null && d.value > 0);

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
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
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
  const resolveProject = (projId: string) => nameMaps?.project?.[projId] ?? projId;
  const allDates = [
    ...new Set(projectReports.flatMap((r) => r.dates)),
  ].sort();
  const labels = computeLabels(allDates, groupBy);
  const base = baseTimeseriesConfig(
    labels,
    groupBy,
    'Avg wait (min)',
    '{value} min',
  );

  const series = projectReports.map((r, i) => ({
    name: resolveProject(r.project),
    type: 'line' as const,
    connectNulls: false,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: labels.map((label) =>
      avgWaitOverLabel(
        allDates,
        label,
        groupBy,
        (d) => r.getReport(d)?.totalWaitSeconds ?? 0,
        (d) => r.getReport(d)?.numJobs ?? 0,
      ),
    ),
  }));

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const label = params[0].axisValueLabel ?? params[0].name;
        const rows = (params as any[])
          .filter((p) => p.value !== null && p.value !== undefined)
          .map(
            (p) =>
              `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${p.value} min</b>`,
          )
          .join('<br/>');
        return `<b>${label}</b><br/>${rows}`;
      },
    },
    legend: { data: projectReports.map((r) => resolveProject(r.project)), type: 'scroll', bottom: 60 },
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
  const resolveProject = (projId: string) => nameMaps?.project?.[projId] ?? projId;

  const data = projectReports
    .map((r, i) => {
      const totalJobs = r.dailyReports().reduce((s, d) => s + d.numJobs, 0);
      const totalWait = r
        .dailyReports()
        .reduce((s, d) => s + d.totalWaitSeconds, 0);
      if (totalJobs === 0) return null;
      return {
        name: resolveProject(r.project),
        value: Math.round(totalWait / totalJobs / 60),
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null && d.value > 0);

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
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
        data,
      },
    ],
  };
}
