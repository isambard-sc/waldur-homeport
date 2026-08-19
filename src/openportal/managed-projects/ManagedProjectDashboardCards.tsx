import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col } from 'react-bootstrap';
import type { ManagedProject, Project } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';

import type { AwardDetails } from '../bindings/AwardDetails';
import { fetchUsageReports } from '../reports/api';
import { ProjectUsageReport } from '../reports/ProjectUsageReport';
import { embargoedUntil } from './utils';

interface Props {
  managedProjects: ManagedProject[];
  project: Project;
}

// Matches the Usage Report tab's cache TTL expectation: shows a same-day total
// without re-fetching the full report history on every dashboard load. Manually
// refetching on the Usage Report tab (project.openportal-reports) updates the
// same react-query cache entry, so this widget picks up the fresh total too.
const USAGE_STALE_TIME = 12 * 60 * 60 * 1000;

function allocationUnit(allocationString: string | null | undefined): string | undefined {
  if (!allocationString) return undefined;
  const parts = allocationString.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : undefined;
}

function usagePercent(used: number, allocationString: string | null | undefined): number {
  const total = parseFloat(allocationString?.trim().split(/\s+/)[0] ?? '0');
  if (!total) return 0;
  return Math.min(100, (used / total) * 100);
}

function progressVariant(pct: number): string {
  if (pct >= 95) return 'bg-danger';
  if (pct >= 80) return 'bg-warning';
  return 'bg-primary';
}

function formatUsage(hours: number): string {
  return parseFloat(hours.toFixed(2)).toString();
}

interface CardProps {
  mp: ManagedProject;
  project: Project;
}

const ManagedProjectCard: FC<CardProps> = ({ mp, project }) => {
  const details = mp.details as AwardDetails;
  const embargo = embargoedUntil(mp);
  const unit = allocationUnit(details.allocation);
  const projectLinkUrl = details.project_link?.url;
  const breakdown =
    details.breakdown && Object.keys(details.breakdown).length > 0
      ? details.breakdown
      : null;

  const { data: usageReports } = useQuery({
    queryKey: ['openportal-usage-reports', project.uuid],
    queryFn: () => fetchUsageReports({ project_uuid: project.uuid }),
    enabled: Boolean(project.uuid),
    staleTime: USAGE_STALE_TIME,
  });

  const usedHours =
    usageReports === undefined
      ? undefined
      : usageReports.length > 0
        ? ProjectUsageReport.combine(usageReports).totalUsageHours()
        : 0;

  return (
    <Col md={6} sm={12} className="mb-5">
      <Panel cardBordered>
        <div className="d-flex align-items-stretch gap-3">
          {/* Left: details */}
          <div className="flex-grow-1 d-flex flex-column gap-3">
            {details.allocation && (
              <div>
                <div className="fs-6 text-muted fw-bold mb-1">
                  {translate('Allocation')}
                </div>
                <div className="display-6 fw-boldest">
                  {details.allocation}
                </div>
                {breakdown && (
                  <div className="mt-1 fs-7 text-muted">
                    {Object.entries(breakdown).map(([k, v]) => (
                      <span key={k} className="me-3">{k}: {String(v)}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {usedHours !== undefined && (
              <div>
                <div className="fs-6 text-muted fw-bold mb-1">
                  {translate('Used')}
                </div>
                <div className="display-6 fw-boldest">
                  {formatUsage(usedHours)}{unit ? ` ${unit}` : ''}
                </div>
                {(() => {
                  const pct = usagePercent(usedHours, details.allocation);
                  return (
                    <div className="progress mt-2" style={{ height: 6 }}>
                      <div
                        className={`progress-bar ${progressVariant(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
            {embargo && (
              <div className="alert alert-warning p-2 mb-0 fs-7">
                {translate('This allocation is currently on hold until {date}.', {
                  date: formatDate(embargo),
                })}
              </div>
            )}
          </div>

          {/* Right: full-height award link button */}
          {projectLinkUrl && (
            <a
              href={projectLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary d-flex flex-column align-items-center justify-content-center gap-2 px-4"
            >
              <ArrowSquareOutIcon size={22} weight="bold" />
              <span className="fs-7 lh-sm text-center">
                {translate('Go to')}<br />{translate('award')}
              </span>
            </a>
          )}
        </div>
      </Panel>
    </Col>
  );
};

export const ManagedProjectDashboardCards: FC<Props> = ({ managedProjects, project }) => (
  <>
    {managedProjects
      .filter((mp) => mp.state === 'approved' || mp.state === 'pending')
      .map((mp, index) => (
        <ManagedProjectCard
          key={`${mp.destination}-${mp.identifier || mp.local_identifier || index}`}
          mp={mp}
          project={project}
        />
      ))}
  </>
);
