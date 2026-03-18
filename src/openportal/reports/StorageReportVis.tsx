/**
 * StorageReportVis — interactive ECharts visualisation for ProjectStorageReport data.
 *
 * Accepts an array of ProjectStorageReport instances (already fetched — no API
 * calls are made inside this component). Multiple reports are auto-combined.
 *
 * Interactive controls:
 *   - Chart type toggle: Bar (used vs limit per user) ↔ Timeline
 *   - By user / By project toggle (shown when multiple projects)
 *   - Day/Month toggle (timeline only)
 *   - Volume filter: show all volumes or drill into a single one (bar view, user mode)
 *   - ECharts built-ins: tooltip, save-as-image
 *
 * All filter state is local — zero re-fetches on interaction.
 */

import { FileArrowDownIcon, FileXlsIcon } from '@phosphor-icons/react';
import React, { FC, useMemo, useState } from 'react';

import { EChart } from '@waldur/core/EChart';
import { Tip } from '@waldur/core/Tooltip';

import { ProjectStorageReport } from './ProjectStorageReport';
import { downloadStorageExcel, downloadJson } from './reportExcel';
import {
  buildStorageBarOptions,
  buildStorageTimeseriesOptions,
  buildStorageProjectBarOptions,
  buildStorageProjectTimeseriesOptions,
} from './storageChartOptions';
import { GroupBy, NameMaps } from './usageChartOptions';

type ChartView = 'bar' | 'timeseries';
type GroupMode = 'user' | 'project';

interface Props {
  /** One or more already-fetched reports. Multiple are combined client-side. */
  reports: ProjectStorageReport[];
  height?: string;
  nameMaps?: NameMaps;
}

export const StorageReportVis: FC<Props> = ({ reports, height = '420px', nameMaps }) => {
  const multipleProjects = useMemo(
    () => new Set(reports.map((r) => r.project)).size > 1,
    [reports],
  );

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
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [groupMode, setGroupMode] = useState<GroupMode>(
    multipleProjects ? 'project' : 'user',
  );

  const fullNames = multipleProjects && groupMode === 'user';

  const options = useMemo(() => {
    if (!report) return {};
    if (groupMode === 'project') {
      return view === 'timeseries'
        ? buildStorageProjectTimeseriesOptions(reports, groupBy, nameMaps)
        : buildStorageProjectBarOptions(reports, nameMaps);
    }
    if (view === 'timeseries') return buildStorageTimeseriesOptions(report, groupBy, fullNames, nameMaps);
    return buildStorageBarOptions(report, volumeFilter, fullNames, nameMaps);
  }, [report, reports, view, volumeFilter, groupBy, groupMode, fullNames, nameMaps]);

  if (!report) {
    return <div className="text-muted p-4">No storage data available.</div>;
  }

  const numUsers = report.userIdentifiers().length;
  const numProjects = new Set(reports.map((r) => r.project)).size;
  const destination = reports[0]?.resource ?? '';
  const destinationLabel = nameMaps?.offering?.[destination] ?? destination;
  // Most recent generatedAt across all reports
  const lastGenerated = reports.reduce(
    (best, r) => (r.generatedAt > best ? r.generatedAt : best),
    reports[0].generatedAt,
  );

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        {/* Summary badge */}
        <span className="text-muted small">
          {destinationLabel} &middot; <strong>{numUsers}</strong> user
          {numUsers !== 1 ? 's' : ''} &middot;{' '}
          <strong>{numProjects}</strong> project{numProjects !== 1 ? 's' : ''}{' '}
          &middot; Last generated {lastGenerated.toLocaleString()}
          {report.isEmpty && (
            <span className="badge bg-secondary ms-2">Empty</span>
          )}
        </span>

        {/* Chart type */}
        <div className="btn-group btn-group-sm ms-auto" role="group">
          <button
            type="button"
            className={`btn btn-${view === 'bar' ? 'primary' : 'secondary'}`}
            onClick={() => setView('bar')}
          >
            Bar
          </button>
          {hasDailyData && (
            <button
              type="button"
              className={`btn btn-${view === 'timeseries' ? 'primary' : 'secondary'}`}
              onClick={() => setView('timeseries')}
            >
              Timeline
            </button>
          )}
        </div>

        {/* Day / Month toggle — timeseries only */}
        {view === 'timeseries' && (
          <div className="btn-group btn-group-sm" role="group">
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
        )}

        {/* By user / By project toggle — only when multiple projects */}
        {multipleProjects && (
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn btn-${groupMode === 'user' ? 'primary' : 'secondary'}`}
              onClick={() => setGroupMode('user')}
            >
              By user
            </button>
            <button
              type="button"
              className={`btn btn-${groupMode === 'project' ? 'primary' : 'secondary'}`}
              onClick={() => setGroupMode('project')}
            >
              By project
            </button>
          </div>
        )}

        {/* Volume filter — only relevant for bar view, user mode */}
        {view === 'bar' && groupMode === 'user' && volumes.length > 1 && (
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

        {/* Download buttons */}
        <div className="d-flex gap-2 ms-auto">
          <Tip id="tip-storage-excel" label="Download Excel">
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={() => downloadStorageExcel(report, `storage_report`, nameMaps)}
            >
              <FileXlsIcon size={20} />
            </button>
          </Tip>
          <Tip id="tip-storage-json" label="Download JSON">
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={() =>
                downloadJson(
                  reports.map((r) => r.apiItem),
                  `storage_report.json`,
                )
              }
            >
              <FileArrowDownIcon size={20} />
            </button>
          </Tip>
        </div>
      </div>

      {/* ── Chart ────────────────────────────────────────────────────── */}
      <EChart
        options={options}
        height={height}
        exportTitle={`${destinationLabel} storage`}
      />
    </div>
  );
};
