/**
 * UsageReportVis — interactive ECharts visualisation for ProjectUsageReport data.
 *
 * Accepts an array of ProjectUsageReport instances (already fetched — no API
 * calls are made inside this component). Multiple reports are auto-combined.
 *
 * Interactive controls:
 *   - Metric selector:     Usage (h) / Jobs / Avg Wait
 *   - Chart type toggle:   Timeseries ↔ Pie
 *   - Component selector:  Total / CPU / Memory / Billing / … (usage metric only)
 *   - ECharts built-ins:   legend click (show/hide users), dataZoom scrubber,
 *                          toolbox bar↔line toggle, save-as-image
 *
 * All filter state is local — zero re-fetches on interaction.
 */

import { FileArrowDownIcon, FileXlsIcon } from '@phosphor-icons/react';
import React, { FC, useMemo, useState } from 'react';

import { EChart } from '@waldur/core/EChart';
import { Tip } from '@waldur/core/Tooltip';

import { ProjectUsageReport } from './ProjectUsageReport';
import { downloadUsageExcel, downloadJson } from './reportExcel';
import {
  UsageComponent,
  UsageMetric,
  buildAvgWaitPieOptions,
  buildAvgWaitTimeseriesOptions,
  buildJobsPieOptions,
  buildJobsTimeseriesOptions,
  buildPieOptions,
  buildTimeseriesOptions,
} from './usageChartOptions';

type ChartView = 'timeseries' | 'pie';

const METRIC_LABELS: Record<UsageMetric, string> = {
  usage: 'Usage (h)',
  jobs: 'Jobs',
  avg_wait: 'Avg Wait',
};

interface Props {
  /** One or more already-fetched reports. Multiple are combined client-side. */
  reports: ProjectUsageReport[];
  height?: string;
}

export const UsageReportVis: FC<Props> = ({ reports, height = '420px' }) => {
  const report = useMemo(
    () =>
      reports.length === 0
        ? null
        : reports.length === 1
          ? reports[0]
          : ProjectUsageReport.combine(reports),
    [reports],
  );

  const components = useMemo(
    () => (report ? ['total', ...report.componentNames()] : ['total']),
    [report],
  );

  const [metric, setMetric] = useState<UsageMetric>('usage');
  const [view, setView] = useState<ChartView>('timeseries');
  const [component, setComponent] = useState<UsageComponent>('total');

  const options = useMemo(() => {
    if (!report) return {};
    if (metric === 'jobs') {
      return view === 'timeseries'
        ? buildJobsTimeseriesOptions(report)
        : buildJobsPieOptions(report);
    }
    if (metric === 'avg_wait') {
      return view === 'timeseries'
        ? buildAvgWaitTimeseriesOptions(report)
        : buildAvgWaitPieOptions(report);
    }
    // usage
    return view === 'timeseries'
      ? buildTimeseriesOptions(report, component)
      : buildPieOptions(report, component);
  }, [report, metric, view, component]);

  if (!report) {
    return <div className="text-muted p-4">No usage data available.</div>;
  }

  const totalHours = report.totalUsageHours();
  const numUsers = report.localUsers().length;

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        {/* Summary badge */}
        <span className="text-muted small">
          {report.project} &middot; {report.year}-
          {String(report.month).padStart(2, '0')} &middot;{' '}
          <strong>{totalHours.toFixed(1)} h</strong> across{' '}
          <strong>{numUsers}</strong> user{numUsers !== 1 ? 's' : ''}
          {!report.isComplete && (
            <span className="badge bg-warning ms-2">In progress</span>
          )}
        </span>

        {/* Metric selector */}
        <div className="btn-group btn-group-sm ms-auto" role="group">
          {(Object.keys(METRIC_LABELS) as UsageMetric[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`btn btn-${metric === m ? 'primary' : 'secondary'}`}
              onClick={() => setMetric(m)}
            >
              {METRIC_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Timeseries / Pie toggle */}
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn btn-${view === 'timeseries' ? 'primary' : 'secondary'}`}
            onClick={() => setView('timeseries')}
          >
            Timeline
          </button>
          <button
            type="button"
            className={`btn btn-${view === 'pie' ? 'primary' : 'secondary'}`}
            onClick={() => setView('pie')}
          >
            Pie
          </button>
        </div>

        {/* Component filter — only relevant for usage metric */}
        {metric === 'usage' && components.length > 1 && (
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={component}
            onChange={(e) => setComponent(e.target.value as UsageComponent)}
          >
            {components.map((c) => (
              <option key={c} value={c}>
                {c === 'total' ? 'All usage' : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        )}

        {/* Download buttons */}
        <div className="d-flex gap-2 ms-auto">
          <Tip id="tip-usage-excel" label="Download Excel">
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={() =>
                downloadUsageExcel(
                  report,
                  `${report.project} usage ${report.year}-${String(report.month).padStart(2, '0')}`,
                )
              }
            >
              <FileXlsIcon size={20} />
            </button>
          </Tip>
          <Tip id="tip-usage-json" label="Download JSON">
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={() =>
                downloadJson(
                  reports.map((r) => r.apiItem),
                  `${report.project} usage ${report.year}-${String(report.month).padStart(2, '0')}.json`,
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
        exportTitle={`${report.project} ${METRIC_LABELS[metric]} ${report.year}-${String(report.month).padStart(2, '0')}`}
      />
    </div>
  );
};
