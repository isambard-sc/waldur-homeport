import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, ReactNode } from 'react';
import { Col } from 'react-bootstrap';
import { openportalRemoteProjectsTotalUsageRetrieve } from 'waldur-js-client';
import type { RemoteProject } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';

import { RemoteProjectStateField } from './RemoteProjectStateField';

interface Props {
  remoteProjects: RemoteProject[];
  customerEmail?: string;
}

function getLinkUrl(link: unknown): string | undefined {
  if (!link) return undefined;
  if (typeof link === 'string') return link || undefined;
  if (typeof link !== 'object') return undefined;
  const l = link as Record<string, unknown>;
  return typeof l.url === 'string' && l.url ? l.url : undefined;
}

function isEmbargoed(earliestApprove: string | null | undefined): boolean {
  if (!earliestApprove) return false;
  const dt = DateTime.fromISO(earliestApprove);
  return dt.isValid && dt.diffNow('hours').hours > 24;
}

function isIndefiniteEmbargo(earliestApprove: string | null | undefined): boolean {
  if (!earliestApprove) return false;
  const dt = DateTime.fromISO(earliestApprove);
  return dt.isValid && dt.diffNow('years').years > 1;
}

function daysSince(since: string | null | undefined): number {
  if (!since) return 0;
  const dt = DateTime.fromISO(since);
  return dt.isValid ? DateTime.now().diff(dt, 'days').days : 0;
}

function formatUsage(hours: number): string {
  return parseFloat(hours.toFixed(2)).toString();
}

function allocationUnit(allocationString: string | null | undefined): string | undefined {
  if (!allocationString) return undefined;
  const parts = allocationString.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : undefined;
}

function usagePercent(used: number, allocationString: string | null | undefined, currentAllocation: string | null | undefined): number {
  const raw = allocationString?.trim().split(/\s+/)[0] ?? currentAllocation;
  const total = parseFloat(raw ?? '0');
  if (!total) return 0;
  return Math.min(100, (used / total) * 100);
}

function progressVariant(pct: number): string {
  if (pct >= 95) return 'bg-danger';
  if (pct >= 80) return 'bg-warning';
  return 'bg-primary';
}

interface CardProps {
  rp: RemoteProject;
  customerEmail?: string;
}

const RemoteProjectCard: FC<CardProps> = ({ rp, customerEmail }) => {
  const resourceUuid = (rp as any).resource_uuid as string | null | undefined;
  const resourceName = (rp as any).resource_name as string | null | undefined;
  const allocationString = (rp as any).allocation_string as string | null | undefined;
  const projectUrl = getLinkUrl(rp.link_project);
  const embargoed = isEmbargoed(rp.earliest_approve);
  const pendingTooLong =
    !embargoed && rp.has_pending_change && daysSince(rp.pending_since) > 7;
  const breakdown =
    rp.breakdown &&
    typeof rp.breakdown === 'object' &&
    Object.keys(rp.breakdown as object).length > 0
      ? (rp.breakdown as Record<string, unknown>)
      : null;
  const unit = allocationUnit(allocationString);

  const { data: usageData } = useQuery({
    queryKey: ['remote-project-total-usage', rp.uuid],
    queryFn: () =>
      openportalRemoteProjectsTotalUsageRetrieve({ path: { uuid: rp.uuid } }).then(
        (r) => (r.data as any).total_hours as number,
      ),
    staleTime: 5 * 60 * 1000,
  });

  const mailtoHref = customerEmail
    ? `mailto:${customerEmail}?subject=${encodeURIComponent(
        `Query about remote project ${rp.identifier ?? ''} on ${rp.destination}`,
      )}`
    : undefined;

  const allocatorLink: ReactNode = mailtoHref ? (
    <>
      {translate('If you have any questions, please')}{' '}
      <a href={mailtoHref}>{translate('email your allocator')}</a>.
    </>
  ) : (
    translate('If you have any questions, please contact your allocator.')
  );

  return (
    <Col md={6} sm={12} className="mb-5">
      <Panel
        title={
          <div className="d-flex justify-content-between align-items-center gap-3 w-100">
            <div>
              {resourceUuid ? (
                <Link
                  state="marketplace-resource-details"
                  params={{ resource_uuid: resourceUuid }}
                >
                  {resourceName ?? rp.destination}
                </Link>
              ) : (
                <span>{resourceName ?? rp.destination}</span>
              )}
              {resourceName && (
                <div className="fs-7 fw-normal text-muted mt-1">{rp.destination}</div>
              )}
            </div>
            {rp.state && <RemoteProjectStateField state={rp.state} />}
          </div>
        }
        cardBordered
      >
        <div className="d-flex align-items-stretch gap-3">
          {/* Left: details */}
          <div className="flex-grow-1 d-flex flex-column gap-2">
            {(allocationString || rp.current_allocation) && (
              <div>
                <span className="text-muted me-2">{translate('Allocation:')}</span>
                <span className="fw-semibold">
                  {allocationString ?? rp.current_allocation}
                </span>
                {rp.has_pending_change && rp.pending_allocation && (
                  <span className="text-muted ms-2 fs-7">
                    ({translate('pending:')} {rp.pending_allocation})
                  </span>
                )}
                {breakdown && (
                  <div className="ms-2 mt-1 fs-7 text-muted">
                    {Object.entries(breakdown).map(([k, v]) => (
                      <span key={k} className="me-3">{k}: {String(v)}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {usageData !== undefined && (
              <div>
                <div>
                  <span className="text-muted me-2">{translate('Used:')}</span>
                  <span className="fw-semibold">
                    {formatUsage(usageData)}{unit ? ` ${unit}` : ''}
                  </span>
                </div>
                {(() => {
                  const pct = usagePercent(usageData, allocationString, rp.current_allocation);
                  return (
                    <div className="progress mt-1" style={{ height: 6 }}>
                      <div
                        className={`progress-bar ${progressVariant(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
            {rp.identifier && (
              <div className="fs-7 text-muted">
                <span className="me-2">{translate('Identifier:')}</span>
                <code>{rp.identifier}</code>
              </div>
            )}
            {!projectUrl && rp.state !== 'active' && (
              <div className="alert alert-warning p-2 mb-0 fs-7">
                {embargoed ? (
                  <>
                    <div>{isIndefiniteEmbargo(rp.earliest_approve)
                      ? translate('Allocation of this resource is currently on hold.')
                      : translate(
                          'This resource will not be allocated before {date}.',
                          { date: formatDate(rp.earliest_approve) },
                        )
                    }</div>
                    <div>{allocatorLink}</div>
                  </>
                ) : (
                  <>
                    <div>{translate(
                      'The allocated resource is not yet ready. This can take up to 5 working days.',
                    )}</div>
                    <div>{allocatorLink}</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: full-height project link button */}
          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary d-flex flex-column align-items-center justify-content-center gap-2 px-4"
            >
              <ArrowSquareOutIcon size={22} weight="bold" />
              <span className="fs-7 lh-sm text-center">
                {translate('Go to')}<br />{translate('project')}
              </span>
            </a>
          )}
        </div>

        {pendingTooLong && (
          <div className="alert alert-warning p-2 mt-3 mb-0 fs-7">
            <div>{translate(
              'It looks like it is taking longer than normal to make this change.',
            )}</div>
            <div>{allocatorLink}</div>
          </div>
        )}
        {rp.state === 'error' && (
          <div className="alert alert-danger p-2 mt-3 mb-0 fs-7">
            <div>{translate('The allocation of the resource failed or is in an error state.')}</div>
            <div>{allocatorLink}</div>
          </div>
        )}
      </Panel>
    </Col>
  );
};

export const RemoteProjectDashboardCards: FC<Props> = ({ remoteProjects, customerEmail }) => (
  <>
    {remoteProjects
      .filter((rp) => rp.state !== 'deleted')
      .map((rp) => (
        <RemoteProjectCard key={rp.uuid} rp={rp} customerEmail={customerEmail} />
      ))}
  </>
);
