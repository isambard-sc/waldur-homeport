/**
 * Pure functions that build EChartsOption objects from ProjectUsageReport data.
 * No React, no API calls — accepts wrapper class instances and returns options.
 *
 * Three metrics, two views each:
 *   buildTimeseriesOptions / buildPieOptions  — CPU-hours (or component hours)
 *   buildJobsTimeseriesOptions / buildJobsPieOptions  — job counts per user
 *   buildAvgWaitTimeseriesOptions / buildAvgWaitPieOptions  — avg scheduler wait
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
export type UsageComponent = 'total' | string; // "total" | "cpu" | "memory" | "billing" | …

/**
 * Build a stacked-bar (or line) + dataZoom chart showing daily usage per user.
 *
 * ECharts handles internally:
 *   - legend click → show/hide individual user series
 *   - dataZoom slider → interactive date-range pan/zoom
 *   - toolbox magicType → switch between bar and line without a React state change
 */
export function buildTimeseriesOptions(
  report: ProjectUsageReport,
  component: UsageComponent = 'total',
): EChartsOption {
  const dates = report.dates;
  const users = report.localUsers();

  const getHours = (user: string, date: string): number => {
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

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const date = params[0].axisValueLabel ?? params[0].name;
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
        return `<b>${date}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${total.toFixed(2)} h</b>`;
      },
    },
    legend: {
      data: users,
      type: 'scroll',
      bottom: 40,
    },
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
        height: 20,
        // Show the full range by default — user can scrub
        start: 0,
        end: 100,
      },
      { type: 'inside', xAxisIndex: 0 },
    ],
    grid: { bottom: 80 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 30, formatter: (v: string) => v.slice(5) }, // show MM-DD
    },
    yAxis: {
      type: 'value',
      name: yLabel,
      axisLabel: { formatter: '{value} h' },
    },
    series: users.map((user, i) => ({
      name: user,
      type: 'bar',
      stack: 'usage',
      emphasis: { focus: 'series' },
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      data: dates.map((date) => getHours(user, date)),
    })),
  };
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

/** Common dataZoom + toolbox + xAxis config reused across all timeseries charts */
function baseTimeseriesConfig(dates: string[], yName: string, yFormatter: string) {
  return {
    toolbox: {
      right: 10,
      feature: {
        magicType: { type: ['bar', 'line'], title: { bar: 'Bar chart', line: 'Line chart' } },
        saveAsImage: { title: 'Save image' },
      },
    },
    dataZoom: [
      { type: 'slider', xAxisIndex: 0, bottom: 10, height: 20, start: 0, end: 100 },
      { type: 'inside', xAxisIndex: 0 },
    ],
    grid: { bottom: 80 },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: { rotate: 30, formatter: (v: string) => v.slice(5) },
    },
    yAxis: {
      type: 'value' as const,
      name: yName,
      axisLabel: { formatter: yFormatter },
    },
  };
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

/**
 * Stacked bar chart: number of jobs per user per day.
 * Total-jobs line overlaid on a second y-axis for readability.
 */
export function buildJobsTimeseriesOptions(
  report: ProjectUsageReport,
): EChartsOption {
  const dates = report.dates;
  const users = report.localUsers();
  const base = baseTimeseriesConfig(dates, 'Jobs', '{value}');

  const userSeries = users.map((user, i) => ({
    name: user,
    type: 'bar' as const,
    stack: 'jobs',
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: dates.map((date) => report.getReport(date)?.userJobCounts[user] ?? 0),
  }));

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const date = params[0].axisValueLabel ?? params[0].name;
        const total = (params as any[]).reduce((s, p) => s + (p.value as number), 0);
        const rows = (params as any[])
          .filter((p) => (p.value as number) > 0)
          .map((p) =>
            `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${p.value}</b>`,
          )
          .join('<br/>');
        return `<b>${date}</b><br/>${rows}<br/><hr style="margin:4px 0"/>Total: <b>${total}</b>`;
      },
    },
    legend: { data: users, type: 'scroll', bottom: 40 },
    ...base,
    series: userSeries,
  };
}

/**
 * Donut pie chart: total jobs per user across all days.
 */
export function buildJobsPieOptions(report: ProjectUsageReport): EChartsOption {
  const users = report.localUsers();

  // Sum user_job_counts across all daily reports
  const data = users
    .map((user, i) => {
      const total = report.dailyReports().reduce(
        (s, d) => s + (d.userJobCounts[user] ?? 0),
        0,
      );
      return { name: user, value: total, itemStyle: { color: PALETTE[i % PALETTE.length] } };
    })
    .filter((d) => d.value > 0);

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} jobs ({d}%)' },
    legend: { orient: 'vertical', right: 10, type: 'scroll' },
    series: [{
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
    }],
  };
}

// ─── Average wait ─────────────────────────────────────────────────────────────

/**
 * Line chart: average scheduler wait time per user per day (minutes).
 * Not stacked — averages don't add up meaningfully.
 * Days with zero jobs for a user are shown as null (gap in line).
 */
export function buildAvgWaitTimeseriesOptions(
  report: ProjectUsageReport,
): EChartsOption {
  const dates = report.dates;
  const users = report.localUsers();
  const base = baseTimeseriesConfig(dates, 'Avg wait (min)', '{value} min');

  const userSeries = users.map((user, i) => ({
    name: user,
    type: 'line' as const,
    connectNulls: false,
    emphasis: { focus: 'series' as const },
    itemStyle: { color: PALETTE[i % PALETTE.length] },
    data: dates.map((date) => {
      const daily = report.getReport(date);
      if (!daily) return null;
      const jobs = daily.userJobCounts[user] ?? 0;
      if (jobs === 0) return null;
      return Math.round((daily.userWaitSeconds[user] ?? 0) / jobs / 60);
    }),
  }));

  // Total average wait line
  const totalSeries = {
    name: 'Total avg',
    type: 'line' as const,
    lineStyle: { type: 'dashed' as const, width: 2 },
    itemStyle: { color: '#999' },
    connectNulls: false,
    data: dates.map((date) => {
      const daily = report.getReport(date);
      if (!daily || daily.numJobs === 0) return null;
      return Math.round(daily.totalWaitSeconds / daily.numJobs / 60);
    }),
  };

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const date = params[0].axisValueLabel ?? params[0].name;
        const rows = (params as any[])
          .filter((p) => p.value !== null && p.value !== undefined)
          .map((p) =>
            `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${p.value} min</b>`,
          )
          .join('<br/>');
        return `<b>${date}</b><br/>${rows}`;
      },
    },
    legend: { data: [...users, 'Total avg'], type: 'scroll', bottom: 40 },
    ...base,
    // Override toolbox — avg wait shouldn't offer stacked bar
    toolbox: {
      right: 10,
      feature: { saveAsImage: { title: 'Save image' } },
    },
    series: [...userSeries, totalSeries],
  };
}

/**
 * Donut pie chart: average wait time per user across all days (minutes).
 * Value = total wait seconds for user / total jobs for user.
 */
export function buildAvgWaitPieOptions(report: ProjectUsageReport): EChartsOption {
  const users = report.localUsers();

  const data = users
    .map((user, i) => {
      const totalJobs = report.dailyReports().reduce(
        (s, d) => s + (d.userJobCounts[user] ?? 0),
        0,
      );
      const totalWait = report.dailyReports().reduce(
        (s, d) => s + (d.userWaitSeconds[user] ?? 0),
        0,
      );
      if (totalJobs === 0) return null;
      const avgMin = Math.round(totalWait / totalJobs / 60);
      return { name: user, value: avgMin, itemStyle: { color: PALETTE[i % PALETTE.length] } };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null && d.value > 0);

  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} min avg ({d}%)' },
    legend: { orient: 'vertical', right: 10, type: 'scroll' },
    series: [{
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
    }],
  };
}

/**
 * Build a donut pie chart showing total usage per user.
 */
export function buildPieOptions(
  report: ProjectUsageReport,
  component: UsageComponent = 'total',
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
      return {
        name: user,
        value: hours,
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      };
    })
    .filter((d) => d.value > 0);

  const label =
    component === 'total' ? 'Total usage' : `${component} usage`;

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} h ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      type: 'scroll',
    },
    series: [
      {
        name: label,
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
        },
        emphasis: {
          label: { show: true, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
        },
        data,
      },
    ],
  };
}
