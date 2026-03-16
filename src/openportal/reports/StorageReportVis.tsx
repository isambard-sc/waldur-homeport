/**
 * StorageReportVis — interactive ECharts visualisation for ProjectStorageReport data.
 *
 * Accepts an array of ProjectStorageReport instances (already fetched — no API
 * calls are made inside this component). Multiple reports are auto-combined.
 *
 * Interactive controls:
 *   - Chart type toggle: Bar (used vs limit per user) ↔ Treemap (hierarchical usage)
 *   - Volume filter: show all volumes or drill into a single one
 *   - ECharts built-ins: tooltip, save-as-image
 *
 * All filter state is local — zero re-fetches on interaction.
 */

import React, { FC, useMemo, useState } from 'react';

import { EChart } from '@waldur/core/EChart';

import { ProjectStorageReport } from './ProjectStorageReport';
import {
  buildStorageBarOptions,
  buildStorageTimeseriesOptions,
} from './storageChartOptions';

type ChartView = 'bar' | 'timeseries';

interface Props {
  /** One or more already-fetched reports. Multiple are combined client-side. */
  reports: ProjectStorageReport[];
  height?: string;
}

export const StorageReportVis: FC<Props> = ({ reports, height = '420px' }) => {
  const report = useMemo(
    () =>
      reports.length === 0
        ? null
        : reports.length === 1
          ? reports[0]
          : ProjectStorageReport.combine(reports),
    [reports],
  );

  const volumes = useMemo(
    () => (report ? report.volumes() : []),
    [report],
  );

  const hasDailyData = useMemo(() => (report?.dates.length ?? 0) > 0, [report]);

  const [view, setView] = useState<ChartView>('bar');
  const [volumeFilter, setVolumeFilter] = useState<string>('all');

  const options = useMemo(() => {
    if (!report) return {};
    if (view === 'timeseries') return buildStorageTimeseriesOptions(report);
    return buildStorageBarOptions(report, volumeFilter);
  }, [report, view, volumeFilter]);

  if (!report) {
    return <div className="text-muted p-4">No storage data available.</div>;
  }

  const numUsers = report.userIdentifiers().length;
  const generated = report.generatedAt.toLocaleString();

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        {/* Summary badge */}
        <span className="text-muted small">
          {report.project} &middot; {report.year}-
          {String(report.month).padStart(2, '0')} &middot;{' '}
          <strong>{numUsers}</strong> user{numUsers !== 1 ? 's' : ''} &middot;{' '}
          generated {generated}
          {report.isEmpty && (
            <span className="badge bg-secondary ms-2">Empty</span>
          )}
        </span>

        {/* Chart type */}
        <div className="btn-group btn-group-sm ms-auto" role="group">
          <button
            type="button"
            className={`btn btn-${view === 'bar' ? 'primary' : 'outline-primary'}`}
            onClick={() => setView('bar')}
          >
            Bar
          </button>
          {hasDailyData && (
            <button
              type="button"
              className={`btn btn-${view === 'timeseries' ? 'primary' : 'outline-primary'}`}
              onClick={() => setView('timeseries')}
            >
              Timeline
            </button>
          )}
        </div>

        {/* Volume filter — only relevant for bar view */}
        {view === 'bar' && volumes.length > 1 && (
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={volumeFilter}
            onChange={(e) => setVolumeFilter(e.target.value)}
          >
            <option value="all">All volumes</option>
            {volumes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Chart ────────────────────────────────────────────────────── */}
      <EChart
        options={options}
        height={height}
        exportTitle={`${report.project} storage ${report.year}-${String(report.month).padStart(2, '0')}`}
      />
    </div>
  );
};
