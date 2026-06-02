import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';
import { openportalRemoteProjectsList } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';

import { RemoteProjectStateField } from './RemoteProjectStateField';

interface Props {
  projectUuid: string;
  customerEmail?: string;
}

function getLinkUrl(link: unknown): string | undefined {
  if (!link) return undefined;
  if (typeof link === 'string') return link || undefined;
  if (typeof link !== 'object') return undefined;
  const l = link as Record<string, unknown>;
  return typeof l.url === 'string' && l.url ? l.url : undefined;
}

function getLinkLabel(link: unknown): string | undefined {
  if (!link) return undefined;
  if (typeof link === 'string') return link || undefined;
  if (typeof link !== 'object') return undefined;
  const l = link as Record<string, unknown>;
  return (typeof l.id === 'string' && l.id ? l.id : undefined) ??
    (typeof l.url === 'string' && l.url ? l.url : undefined);
}

function isEmbargoed(earliestApprove: string | null | undefined): boolean {
  if (!earliestApprove) return false;
  const dt = DateTime.fromISO(earliestApprove);
  return dt.isValid && dt.diffNow('hours').hours > 24;
}

function daysSince(since: string | null | undefined): number {
  if (!since) return 0;
  const dt = DateTime.fromISO(since);
  return dt.isValid ? DateTime.now().diff(dt, 'days').days : 0;
}

export const RemoteProjectDashboardCards: FC<Props> = ({ projectUuid, customerEmail }) => {
  const { data: remoteProjects } = useQuery({
    queryKey: ['remote-projects-for-project', projectUuid],
    queryFn: () =>
      openportalRemoteProjectsList({ query: { project_uuid: projectUuid } }).then(
        (r) => r.data,
      ),
    enabled: Boolean(projectUuid),
    staleTime: 5 * 60 * 1000,
  });

  if (!remoteProjects?.length) return null;

  return (
    <Row>
      {remoteProjects.map((rp) => {
        const projectUrl = getLinkUrl(rp.link_project);
        const awardUrl = getLinkUrl(rp.link_award);
        const awardLabel = getLinkLabel(rp.link_award);
        const embargoed = isEmbargoed(rp.earliest_approve);
        const pendingTooLong =
          !embargoed && rp.has_pending_change && daysSince(rp.pending_since) > 7;
        const allocationString = (rp as any).allocation_string as string | null | undefined;
        const breakdown =
          rp.breakdown &&
          typeof rp.breakdown === 'object' &&
          Object.keys(rp.breakdown as object).length > 0
            ? (rp.breakdown as Record<string, unknown>)
            : null;

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
          <Col key={rp.uuid} md={6} sm={12} className="mb-5">
            <Panel
              title={
                <div className="d-flex justify-content-between align-items-center gap-3 w-100">
                  <span>{rp.destination}</span>
                  {rp.state && <RemoteProjectStateField state={rp.state} />}
                </div>
              }
              cardBordered
            >
              {rp.identifier && (
                <div className="mb-2">
                  <span className="text-muted me-2">{translate('Identifier:')}</span>
                  <code>{rp.identifier}</code>
                </div>
              )}
              {(allocationString || rp.current_allocation) && (
                <div className="mb-2">
                  <div>
                    <span className="text-muted me-2">{translate('Allocation:')}</span>
                    {allocationString ?? rp.current_allocation}
                    {rp.has_pending_change && rp.pending_allocation && (
                      <span className="text-muted ms-2 fs-7">
                        ({translate('pending:')} {rp.pending_allocation})
                      </span>
                    )}
                  </div>
                  {breakdown && (
                    <div className="ms-2 mt-1 fs-7 text-muted">
                      {Object.entries(breakdown).map(([k, v]) => (
                        <span key={k} className="me-3">{k}: {String(v)}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {awardUrl && awardLabel && (
                <div className="mb-2">
                  <span className="text-muted me-2">{translate('Award:')}</span>
                  <a href={awardUrl} target="_blank" rel="noopener noreferrer">
                    {awardLabel}
                  </a>
                </div>
              )}
              <div className="mt-3">
                {projectUrl ? (
                  <a
                    href={projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    {translate('Open in remote portal')}
                  </a>
                ) : rp.state !== 'active' ? (
                  <div className="alert alert-warning p-2 mb-0 fs-7">
                    {embargoed ? (
                      <>
                        {translate(
                          'This project is under embargo and cannot be activated before {date}.',
                          { date: formatDate(rp.earliest_approve) },
                        )}{' '}
                        {allocatorLink}
                      </>
                    ) : (
                      <>
                        {translate(
                          'This project is not yet ready on the remote portal.',
                        )}{' '}
                        {allocatorLink}
                      </>
                    )}
                  </div>
                ) : null}
              </div>
              {pendingTooLong && (
                <div className="alert alert-warning p-2 mt-2 mb-0 fs-7">
                  {translate(
                    'It looks like it is taking longer than normal to make this change.',
                  )}{' '}
                  {allocatorLink}
                </div>
              )}
              {rp.state === 'error' && (
                <div className="alert alert-danger p-2 mt-2 mb-0 fs-7">
                  {translate('This project is in an error state.')}{' '}
                  {allocatorLink}
                </div>
              )}
            </Panel>
          </Col>
        );
      })}
    </Row>
  );
};
