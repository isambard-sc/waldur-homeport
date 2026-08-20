import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { Col } from 'react-bootstrap';
import {
  ManagedProject,
  openportalManagedProjectAccountingSummaryList,
  Project,
} from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';

import type { AwardDetails } from '../bindings/AwardDetails';
import { embargoedUntil } from './utils';

interface Props {
  managedProjects: ManagedProject[];
  project: Project;
}

const ACCOUNTING_SUMMARY_STALE_TIME = 5 * 60 * 1000;

function usagePercent(used: number, total: number | null | undefined): number {
  if (!total) return 0;
  return Math.min(100, (used / total) * 100);
}

function progressVariant(pct: number): string {
  if (pct >= 95) return 'bg-danger';
  if (pct >= 80) return 'bg-warning';
  return 'bg-primary';
}

interface CardProps {
  mp: ManagedProject;
  project: Project;
}

const ManagedProjectCard: FC<CardProps> = ({ mp, project }) => {
  const details = mp.details as AwardDetails;
  const embargo = embargoedUntil(mp);
  const projectLinkUrl = details.project_link?.url;
  const breakdown =
    details.breakdown && Object.keys(details.breakdown).length > 0
      ? details.breakdown
      : null;

  const { data: accountingSummary } = useQuery({
    queryKey: ['managed-project-accounting-summary', project.uuid],
    queryFn: () =>
      openportalManagedProjectAccountingSummaryList({
        query: { project_uuid: project.uuid },
      }).then((r) => r.data?.[0] ?? null),
    enabled: Boolean(project.uuid),
    staleTime: ACCOUNTING_SUMMARY_STALE_TIME,
  });

  const allocationCredits = accountingSummary?.allocation_credits;
  const usageCredits = accountingSummary?.usage_credits;
  const remainingCredits = accountingSummary?.remaining_credits;

  useEffect(() => {
    if (
      allocationCredits == null ||
      usageCredits == null ||
      remainingCredits == null
    ) {
      return;
    }
    const expected = allocationCredits - usageCredits;
    if (Math.abs(remainingCredits - expected) > 0.01) {
      // eslint-disable-next-line no-console
      console.warn(
        'ManagedProjectAccountingSummary: remaining_credits does not equal allocation_credits - usage_credits',
        { project_uuid: project.uuid, allocationCredits, usageCredits, remainingCredits },
      );
    }
  }, [project.uuid, allocationCredits, usageCredits, remainingCredits]);

  return (
    <Col md={6} sm={12} className="mb-5">
      <Panel cardBordered>
        <div className="d-flex align-items-stretch gap-3">
          {/* Left: details */}
          <div className="flex-grow-1 d-flex flex-column gap-3">
            {allocationCredits != null && (
              <div>
                <div className="fs-6 text-muted fw-bold mb-1">
                  {translate('Allocation')}
                </div>
                <div className="display-6 fw-boldest">
                  {defaultCurrency(allocationCredits)}
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
            {usageCredits != null && (
              <div>
                <div className="fs-6 text-muted fw-bold mb-1">
                  {translate('Used')}
                </div>
                <div className="display-6 fw-boldest">
                  {defaultCurrency(usageCredits)}
                </div>
                {allocationCredits != null && (() => {
                  const pct = usagePercent(usageCredits, allocationCredits);
                  return (
                    <>
                      <div className="progress mt-2" style={{ height: 6 }}>
                        <div
                          className={`progress-bar ${progressVariant(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {remainingCredits != null && (
                        <div className="fs-8 text-muted mt-1">
                          {translate('{amount} remaining', {
                            amount: defaultCurrency(remainingCredits),
                          })}
                        </div>
                      )}
                    </>
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
