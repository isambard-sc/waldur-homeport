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
 * Horizontal grouped-bar chart.
 *
 * Layout:
 *   Y-axis: local_usernames (or UserIdentifiers when no local name is available)
 *   X-axis: bytes (auto-scaled to the best unit)
 *   For each volume there are two series:
 *     - "volume (used)"  — solid bar showing actual usage
 *     - "volume (limit)" — transparent/ghost bar showing the quota limit
 *
 * The limit bar sits behind the used bar via z-index and barGap, giving a
 * "progress bar within a quota" appearance for each user × volume pair.
 */
export function buildStorageBarOptions(
  report: ProjectStorageReport,
  volumeFilter: string | 'all' = 'all',
): EChartsOption {
  const allVolumes = report.volumes();
  const volumes = volumeFilter === 'all' ? allVolumes : [volumeFilter];
  const uids = report.userIdentifiers();
  const localNames = uids.map((uid) => report.users[uid] ?? uid);

  // Determine a sensible Y-axis scale by looking at the max limit across users
  let maxBytes = 0;
  for (const uid of uids) {
    for (const vol of volumes) {
      const q: Quota | undefined = report.quotaForUser(uid)[vol];
      if (q && isFinite(q.limitBytes)) maxBytes = Math.max(maxBytes, q.limitBytes);
    }
  }

  // Pick a display unit so axis labels are readable
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;
  const unitIndex = maxBytes > 0
    ? Math.min(Math.floor(Math.log(maxBytes) / Math.log(1024)), units.length - 1)
    : 3; // default GB
  const unitDivisor = 1024 ** unitIndex;
  const unitLabel = units[unitIndex];

  const series: EChartsOption['series'] = volumes.flatMap((vol, vi) => {
    const color = PALETTE[vi % PALETTE.length];

    const usedData = uids.map((uid) => {
      const q = report.quotaForUser(uid)[vol];
      return q ? +(q.usageBytes / unitDivisor).toFixed(3) : 0;
    });

    const limitData = uids.map((uid) => {
      const q = report.quotaForUser(uid)[vol];
      if (!q || !isFinite(q.limitBytes)) return 0;
      return +(q.limitBytes / unitDivisor).toFixed(3);
    });

    return [
      {
        name: `${vol}`,
        type: 'bar' as const,
        data: usedData,
        itemStyle: { color },
        emphasis: { focus: 'series' },
        z: 10,
      },
      {
        name: `${vol} (limit)`,
        type: 'bar' as const,
        data: limitData,
        barGap: '-100%',
        itemStyle: { color: withAlpha(color.startsWith('#') ? color : '#006699', 0.15) },
        silent: true, // no tooltip/hover on the ghost bar
        z: 1,
      },
    ];
  });

  return {
    color: PALETTE,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const user = params[0].axisValueLabel ?? params[0].name;
        const uid = uids[localNames.indexOf(user)] ?? user;
        const lines: string[] = [`<b>${user}</b> <small>(${uid})</small>`];
        for (const vol of volumes) {
          const q = report.quotaForUser(uid)?.[vol];
          if (q) {
            const pct = (q.usedFraction * 100).toFixed(1);
            lines.push(`${vol}: ${q.usageFormatted} / ${q.limitFormatted} (${pct}%)`);
          }
        }
        return lines.join('<br/>');
      },
    },
    legend: {
      data: volumes, // only show real series in legend, not ghost limit bars
      bottom: 0,
    },
    toolbox: {
      right: 10,
      feature: { saveAsImage: { title: 'Save image' } },
    },
    grid: { left: '15%', right: '5%', bottom: 40 },
    xAxis: {
      type: 'value',
      name: unitLabel,
      axisLabel: { formatter: `{value} ${unitLabel}` },
    },
    yAxis: {
      type: 'category',
      data: localNames,
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
