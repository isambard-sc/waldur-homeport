import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { getProjectCredit } from '@waldur/customer/credits/api';
import { CreditStatusWidget } from '@waldur/customer/dashboard/CreditStatusWidget';
import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useCreateInvitation } from '@waldur/invitations/actions/useCreateInvitation';
import { AggregateLimitWidget } from '@waldur/marketplace/aggregate-limits/AggregateLimitWidget';
import { getProjectStats } from '@waldur/marketplace/aggregate-limits/api';
import { fetchSelectProjectUsers } from '@waldur/permissions/api';
import { useUser } from '@waldur/workspace/hooks';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';
import { getProjectTeamChart, loadChart } from './utils';

export const ProjectDashboard: FunctionComponent<{}> = () => {
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );

  const user = useUser();
  const project = useSelector(getProject);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('project-users');

  const { data: teamData } = useQuery(
    ['projectTeamData', project?.uuid],
    async () => await getProjectTeamChart(project),
    { staleTime: 5 * 60 * 1000 },
  );

  const { callback, canInvite } = useCreateInvitation({
    project: project,
    roleTypes: ['project'],
  });

  const {
    data: aggregateLimitData,
    isLoading: isAggregateLimitLoading,
    error: aggregateLimitError,
  } = useQuery(
    ['project-stats', project?.uuid],
    () => getProjectStats(project?.uuid),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 },
  );

  const {
    data: creditData,
    isLoading: isCreditLoading,
    error: creditError,
    refetch: refetchCredit,
  } = useQuery(
    ['project-credit', project?.uuid],
    () => getProjectCredit(project?.uuid),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 },
  );

  // FIX: This is temporary. Fixed the issue on backend and use project.billing_price_estimate.total
  const { data } = useQuery(
    ['ProjectDashboardChart', project.uuid],
    () => loadChart(project),
    { staleTime: 5 * 60 * 1000 },
  );

  const shouldShowAggregateLimitWidget =
    aggregateLimitData?.data.components?.length > 0;

  if (!project || !user) {
    return null;
  }
  return (
    <>
      <Row>
        {!shouldConcealPrices && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <ProjectDashboardCostLimits project={project} />
          </Col>
        )}
        <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
          <TeamWidget
            api={() => fetchSelectProjectUsers(project.uuid, { page_size: 5 })}
            scope={project}
            chartData={teamData}
            showChart
            onBadgeClick={goToUsers}
            onAddClick={callback}
            showAdd={canInvite}
            className="h-100"
            nameKey="user_full_name"
            emailKey="user_email"
            imageKey="user_image"
          />
        </Col>
      </Row>
      {shouldShowAggregateLimitWidget && (
        <Row>
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <AggregateLimitWidget
              project={project}
              data={aggregateLimitData}
              isLoading={isAggregateLimitLoading}
              error={aggregateLimitError}
            />
          </Col>
          {Boolean(creditData) && (
            <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
              <CreditStatusWidget
                credit={creditData}
                type="project"
                project={{
                  ...project,
                  billing_price_estimate: {
                    ...(project?.billing_price_estimate || ({} as any)),
                    total: data.chart.data[data.chart.data.length - 1].value,
                  },
                }}
                isLoading={isCreditLoading}
                error={creditError}
                refetch={refetchCredit}
              />
            </Col>
          )}
        </Row>
      )}
      {project.description ? (
        <Panel title={translate('Description')} cardBordered>
          <p>{project.description}</p>
        </Panel>
      ) : null}
    </>
  );
};
