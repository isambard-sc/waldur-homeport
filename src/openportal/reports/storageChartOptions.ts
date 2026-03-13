/**
 * Pure functions that build EChartsOption objects from ProjectStorageReport data.
 *
 * Two chart modes:
 *   'bar'     — grouped horizontal bar chart: used vs limit per user per volume.
 *   'treemap' — hierarchical treemap: user → volume → usage bytes.
 *               Requires the treemap chart type to be registered in echarts/index.ts.
 */

import type { EChartsOption } from 'echarts';

import { ProjectStorageReport, Quota } from './ProjectStorageReport';
import { formatStorageBytes } from './storage';

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
];

/** Slightly transparent version of a palette colour for the limit bar */
const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

/**
 * Horizontal bar chart showing storage usage vs quota limit.
 *
 * Y-axis layout — project-level quotas first, then per-user quotas:
 *   "Project · projects"   ← from report.projectQuotas (shared across all users)
 *   "chris.aiproject"      ← from report.userQuotas (per-user volumes like home/scratch)
 *   "david.aiproject"
 *   …
 *
 * Each volume is a solid "used" bar with a transparent "limit" ghost bar behind it.
 * Project volumes and user volumes are separate series so they never conflict.
 */
export function buildStorageBarOptions(
  report: ProjectStorageReport,
  volumeFilter: string | 'all' = 'all',
): EChartsOption {
  const projectQuotas = report.projectQuotas;
  const projectVolNames = Object.keys(projectQuotas).sort();

  const uids = report.userIdentifiers();
  const localNames = uids.map((uid) => report.users[uid] ?? uid);

  // Derive user-level volume names from actual quota data
  const userVolSet = new Set<string>();
  for (const uid of uids) {
    for (const v of Object.keys(report.quotaForUser(uid))) userVolSet.add(v);
  }
  const userVolNames = [...userVolSet].sort();

  const visibleProjectVols =
    volumeFilter === 'all'
      ? projectVolNames
      : projectVolNames.filter((v) => v === volumeFilter);
  const visibleUserVols =
    volumeFilter === 'all'
      ? userVolNames
      : userVolNames.filter((v) => v === volumeFilter);

  // Y-axis: project rows first, then user rows
  const projectRowLabels = visibleProjectVols.map((v) => `Project · ${v}`);
  const yAxisData = [...projectRowLabels, ...localNames];
  const totalRows = yAxisData.length;
  const projectRowCount = projectRowLabels.length;

  // Determine a readable unit from the largest limit seen anywhere
  let maxBytes = 0;
  for (const [, q] of Object.entries(projectQuotas)) {
    if (isFinite(q.limitBytes)) maxBytes = Math.max(maxBytes, q.limitBytes);
  }
  for (const uid of uids) {
    for (const [, q] of Object.entries(report.quotaForUser(uid))) {
      if (isFinite(q.limitBytes)) maxBytes = Math.max(maxBytes, q.limitBytes);
    }
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
  const unitIndex = maxBytes > 0
    ? Math.min(Math.floor(Math.log(maxBytes) / Math.log(1024)), units.length - 1)
    : 3;
  const unitDivisor = 1024 ** unitIndex;
  const unitLabel = units[unitIndex];

  const toUnit = (bytes: number) => +(bytes / unitDivisor).toFixed(3);
  // Sparse data array: value at specific index, 0 elsewhere
  const sparse = (index: number, value: number) =>
    Array.from({ length: totalRows }, (_, i) => (i === index ? value : 0));

  const series: EChartsOption['series'] = [];
  const legendItems: string[] = [];

  // ── Project-level volume series ──────────────────────────────────────────
  visibleProjectVols.forEach((vol, vi) => {
    const q: Quota | undefined = projectQuotas[vol];
    const color = PALETTE[vi % PALETTE.length];
    const rowIndex = vi; // project rows are at the top

    legendItems.push(vol);
    series.push(
      {
        name: vol,
        type: 'bar' as const,
        data: sparse(rowIndex, q ? toUnit(q.usageBytes) : 0),
        itemStyle: { color },
        emphasis: { focus: 'series' as const },
        z: 10,
      },
      {
        name: `${vol} (limit)`,
        type: 'bar' as const,
        data: sparse(rowIndex, q && isFinite(q.limitBytes) ? toUnit(q.limitBytes) : 0),
        barGap: '-100%',
        itemStyle: { color: withAlpha(color, 0.15) },
        silent: true,
        z: 1,
      },
    );
  });

  // ── Per-user volume series ────────────────────────────────────────────────
  visibleUserVols.forEach((vol, vi) => {
    const color = PALETTE[(visibleProjectVols.length + vi) % PALETTE.length];

    // Data array: zeros for project rows, then one value per user row
    const usedData = [
      ...Array(projectRowCount).fill(0),
      ...uids.map((uid) => {
        const q = report.quotaForUser(uid)[vol];
        return q ? toUnit(q.usageBytes) : 0;
      }),
    ];
    const limitData = [
      ...Array(projectRowCount).fill(0),
      ...uids.map((uid) => {
        const q = report.quotaForUser(uid)[vol];
        return q && isFinite(q.limitBytes) ? toUnit(q.limitBytes) : 0;
      }),
    ];

    legendItems.push(vol);
    series.push(
      {
        name: vol,
        type: 'bar' as const,
        data: usedData,
        itemStyle: { color },
        emphasis: { focus: 'series' as const },
        z: 10,
      },
      {
        name: `${vol} (limit)`,
        type: 'bar' as const,
        data: limitData,
        barGap: '-100%',
        itemStyle: { color: withAlpha(color, 0.15) },
        silent: true,
        z: 1,
      },
    );
  });

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const rowLabel: string = params[0].axisValueLabel ?? params[0].name;
        const isProjectRow = rowLabel.startsWith('Project · ');

        if (isProjectRow) {
          const vol = rowLabel.replace('Project · ', '');
          const q = projectQuotas[vol];
          if (!q) return rowLabel;
          const pct = (q.usedFraction * 100).toFixed(1);
          return `<b>${rowLabel}</b><br/>${q.usageFormatted} / ${q.limitFormatted} (${pct}%)`;
        }

        const uid = uids[localNames.indexOf(rowLabel)] ?? rowLabel;
        const lines: string[] = [`<b>${rowLabel}</b> <small>(${uid})</small>`];
        for (const vol of visibleUserVols) {
          const q = report.quotaForUser(uid)?.[vol];
          if (q) {
            const pct = (q.usedFraction * 100).toFixed(1);
            lines.push(`${vol}: ${q.usageFormatted} / ${q.limitFormatted} (${pct}%)`);
          }
        }
        return lines.join('<br/>');
      },
    },
    legend: { data: legendItems, bottom: 0 },
    toolbox: { right: 10, feature: { saveAsImage: { title: 'Save image' } } },
    grid: { left: '18%', right: '5%', bottom: 40 },
    xAxis: {
      type: 'value',
      name: unitLabel,
      axisLabel: { formatter: `{value} ${unitLabel}` },
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLabel: {
        // Visually distinguish project rows with a different style
        formatter: (v: string) => v,
        rich: {
          project: { fontWeight: 'bold', color: '#555' },
        },
      },
    },
    series,
  };
}

/**
 * Treemap showing hierarchical storage usage breakdown.
 * Hierarchy: user → volume → usage bytes.
 *
 * Note: requires 'echarts/lib/chart/treemap' to be imported in
 * src/echarts/index.ts.
 */
export function buildStorageTreemapOptions(
  report: ProjectStorageReport,
): EChartsOption {
  const treeData = report.userIdentifiers().map((uid, i) => {
    const localName = report.users[uid] ?? uid;
    const quotas = report.quotaForUser(uid);
    const children = Object.entries(quotas)
      .filter(([, q]) => q.usageBytes > 0)
      .map(([vol, q]) => ({
        name: vol,
        value: q.usageBytes,
        tooltip: `${q.usageFormatted} of ${q.limitFormatted}`,
      }));

    const totalUsage = children.reduce((s, c) => s + c.value, 0);
    return {
      name: localName,
      value: totalUsage,
      itemStyle: { color: PALETTE[i % PALETTE.length] },
      children: children.length > 0 ? children : undefined,
    };
  });

  return {
    tooltip: {
      formatter: (info: any) => {
        const value = info.value as number;
        const treePathInfo = info.treePathInfo as Array<{ name: string }>;
        const treePath = treePathInfo.map((p) => p.name).join(' › ');
        return `${treePath}<br/>${formatStorageBytes(value)}`;
      },
    },
    series: [
      {
        type: 'treemap',
        visibleMin: 100,
        label: { show: true, formatter: '{b}' },
        upperLabel: {
          show: true,
          height: 30,
          color: '#fff',
        },
        itemStyle: { borderColor: '#fff', borderWidth: 2, gapWidth: 2 },
        levels: [
          {
            // user level
            itemStyle: { borderWidth: 3, gapWidth: 3 },
            upperLabel: { show: true },
          },
          {
            // volume level
            colorSaturation: [0.4, 0.8],
            itemStyle: { borderWidth: 1, gapWidth: 1 },
            label: { show: true },
          },
        ],
        data: treeData,
      },
    ],
  };
}
