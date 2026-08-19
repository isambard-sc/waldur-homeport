import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { openportalManagedProjectsList, openportalRemoteProjectsList, projectsListUsersList, projectsStatsRetrieve } from 'waldur-js-client';
import type { ManagedProject, RemoteProject } from 'waldur-js-client';

import { count, parseSelectData } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Panel } from '@waldur/core/Panel';
import { TruncatedMarkdown } from '@waldur/core/TruncatedMarkdown';
import { filterComponentsWithUsage } from '@waldur/customer/dashboard/utils';
import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { TeamWidget } from '@waldur/dashboard/TeamWidget';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures, MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { EditButton } from '@waldur/form/EditButton';
import { translate } from '@waldur/i18n';
import { useCreateInvitation } from '@waldur/invitations/actions/useCreateInvitation';
import { AggregateLimitWidget } from '@waldur/marketplace/aggregate-limits/AggregateLimitWidget';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';
import { useThemeFeatures } from '@waldur/theme/useThemeFeatures';

import { canChangeMembership } from '@waldur/openportal/bindings/helpers';
import { ManagedProjectDashboardCards } from '@waldur/openportal/managed-projects/ManagedProjectDashboardCards';
import { RemoteProjectDashboardCards } from '@waldur/openportal/remote-projects/RemoteProjectDashboardCards';

import { ProjectLimitUsageBasedResources } from './dashboard/ProjectLimitUsageBasedResources';
import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';
import { ProjectDashboardCredit } from './ProjectDashboardCredit';
import { ProjectDashboardBalance } from './ProjectDashboardBalance';
import { getProjectTeamChart } from './utils';
import { membershipLockedDialog } from './MembershipLockedDialog';
import { useProjectAwardDetails } from './useProjectAwardDetails';

const EditFieldDialog = lazyComponent(() =>
  import('./manage/EditFieldDialog').then((module) => ({
    default: module.EditFieldDialog,
  })),
);

export const ProjectDashboard: FunctionComponent<{}> = () => {
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );

  const dispatch = useDispatch();
  const user = useUser();
  const userFromSelector = useSelector(getUser);
  const project = useSelector(getProject);
  const customer = useSelector(getCustomer);
  const showRemoteProjects = isFeatureVisible(
    CustomerFeatures.show_openportal_remote_projects,
  );

  const router = useRouter();
  const goToUsers = () => router.stateService.go('project-users');

  const canEditProject =
    userFromSelector &&
    project &&
    (hasPermission(userFromSelector, {
      permission: PermissionEnum.UPDATE_PROJECT,
      projectId: project.uuid,
    }) ||
      hasPermission(userFromSelector, {
        permission: PermissionEnum.UPDATE_PROJECT,
        customerId: project.customer_uuid,
      }));

  const handleEditStaffNotes = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: { project, name: 'staff_notes' },
        size: 'lg',
      }),
    );
  };

  const handleEditDescription = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: { project, name: 'description' },
        size: 'lg',
      }),
    );
  };

  const { data: remoteProjects } = useQuery({
    queryKey: ['remote-projects-for-project', project?.uuid],
    queryFn: () =>
      openportalRemoteProjectsList({ query: { project_uuid: project.uuid } }).then(
        (r) => r.data,
      ),
    enabled: showRemoteProjects && Boolean(project?.uuid),
    staleTime: 5 * 60 * 1000,
  });

  const remoteCount =
    remoteProjects?.filter((rp: RemoteProject) => rp.state !== 'deleted')
      .length ?? 0;
  const hasAnyRemoteProjects = showRemoteProjects && remoteCount > 0;
  const hasManyRemoteProjects = showRemoteProjects && remoteCount > 1;

  const showManagedProjects = isFeatureVisible(
    MarketplaceFeatures.show_managed_projects,
  );

  const { data: managedProjects } = useQuery({
    queryKey: ['managed-projects-for-project', project?.uuid],
    queryFn: () =>
      openportalManagedProjectsList({
        query: { project_uuid: project.uuid },
      }).then((r) => r.data),
    enabled: showManagedProjects && Boolean(project?.uuid),
    staleTime: 5 * 60 * 1000,
  });

  const hasAnyManagedProjects =
    showManagedProjects &&
    (managedProjects?.filter(
      (mp: ManagedProject) => mp.state === 'approved' || mp.state === 'pending',
    ).length ?? 0) > 0;

  const { data: teamData } = useQuery({
    queryKey: ['projectTeamData', project?.uuid],
    queryFn: () => getProjectTeamChart(project),
    staleTime: 5 * 60 * 1000,
  });

  const { callback, canInvite, loadingProjects } = useCreateInvitation({
    project: project,
    roleTypes: ['project'],
  });

  const isProjectRemoved = Boolean(project?.is_removed);

  const { data: awardDetails } = useProjectAwardDetails(project?.uuid);
  const membershipLocked = !canChangeMembership(awardDetails?.membership_control);

  const { data: projectProposal } = useQuery({
    queryKey: ['project-proposal', project?.uuid],
    queryFn: () =>
      proposalProposalsList({
        query: { project_uuid: project.uuid, page_size: 1 },
      }).then((r) => r.data?.[0] ?? null),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(project?.uuid),
  });

  const { data: proposalCall } = useQuery({
    queryKey: ['proposal-call', projectProposal?.call_uuid],
    queryFn: () =>
      proposalProtectedCallsRetrieve({
        path: { uuid: projectProposal.call_uuid },
        query: { field: ['reference_code'] },
      }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(projectProposal?.call_uuid),
  });

  const handleAddClick = membershipLocked && awardDetails
    ? () => dispatch(membershipLockedDialog(awardDetails))
    : callback;

  const {
    data: aggregateLimitData,
    isLoading: isAggregateLimitLoading,
    error: aggregateLimitError,
    refetch: aggregateLimitRefetch,
  } = useQuery({
    queryKey: ['project-stats', project?.uuid],

    queryFn: () =>
      projectsStatsRetrieve({ path: { uuid: project?.uuid } }).then(
        (r) => r.data,
      ),

    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const {
    data: aggregateLimitDataForCurrentMonth,
    isLoading: isAggregateLimitLoadingForCurrentMonth,
    error: aggregateLimitErrorForCurrentMonth,
    refetch: aggregateLimitRefetchForCurrentMonth,
  } = useQuery({
    queryKey: ['project-stats', project?.uuid, 'current-month'],

    queryFn: () =>
      projectsStatsRetrieve({
        path: { uuid: project?.uuid },
        query: { for_current_month: true },
      }).then((r) => r.data),

    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const theme_features = useThemeFeatures();

  const show_resource_limits = theme_features.ShowResourceLimits;

  const currentMonthFilteredData = filterComponentsWithUsage(
    aggregateLimitDataForCurrentMonth,
  );

  const shouldShowAggregateLimitWidget =
    aggregateLimitData?.components?.length > 0 && show_resource_limits;

  const shouldShowCurrentMonthWidget =
    currentMonthFilteredData?.components?.length > 0 && show_resource_limits;

  // Check if there are limit-based resources to show
  const { data: limitBasedResourcesCount } = useQuery({
    queryKey: ['limit-based-resources-count', project?.uuid],
    queryFn: () =>
      project?.uuid
        ? count('/api/marketplace-resources/', {
          project_uuid: project.uuid,
          state: NON_TERMINATED_STATES,
          only_limit_based: true,
          component_count: 1,
        })
        : 0,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
    enabled: Boolean(project?.uuid),
  });

  const shouldShowLimitBasedResources = (limitBasedResourcesCount || 0) > 0;

  const showBillingInfo = project.customer_display_billing_info_in_projects;

  // Permissions are set so project PI and organisation-level owners can see the survey
  const isProjectPI = Boolean(
    userFromSelector &&
      project &&
      (hasPermission(userFromSelector, {
        permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
        projectId: project.uuid,
      }) ||
        hasPermission(userFromSelector, {
          permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
          customerId: project.customer_uuid,
        })),
  );

  // Check if current date is on or after project end date
  const shouldShowSurvey = useMemo(() => {
    if (!project?.end_date) return false;
    const today = new Date();
    const endDate = new Date(project.end_date);
    return today >= endDate;
  }, [project?.end_date]);


  const surveySrc = useMemo(() => {
    const params = new URLSearchParams({ embed: 'true' });

    if (project?.name) {
      params.set('project_name', project.name);
    }

    if (project?.slug) {
      params.set('project_slug', project.slug);
    }

    if (user?.full_name) {
      params.set('user_name', user.full_name);
    }

    if (user?.email) {
      params.set('user_email', user.email);
    }

    const callRef = proposalCall?.reference_code ?? awardDetails?.call?.id;
    const roundStart = projectProposal?.round?.start_time
      ? new Date(projectProposal.round.start_time).toISOString().split('T')[0]
      : undefined;
    const callReference = [callRef, roundStart].filter(Boolean).join(' - ');
    if (callReference) {
      params.set('call_reference', callReference);
    }

    return `https://forms-airr.isambard.ac.uk/s/cms6adb6t0007uk01zr97jsxc?${params.toString()}`;
  }, [project?.name, project?.slug, user?.full_name, user?.email, proposalCall?.reference_code, awardDetails?.call?.id, projectProposal?.round?.start_time]);

  if (!project || !user) {
    return null;
  }
  return (
    <>
      {shouldShowLimitBasedResources && <ProjectLimitUsageBasedResources />}

      {/* Formbricks Survey - Only shown on/after project end date */}
      {shouldShowSurvey && isProjectPI && (
        <Row className="mb-6">
          <Col>
            <h5 className="mb-3">{translate('Project Feedback')}</h5>
            <iframe
              src={surveySrc}
              frameBorder="0"
              style={{width: '100%', height: '525px', border: 'none', borderRadius: '8px', display: 'block'}}
              title="Project Feedback Survey"
            />
          </Col>
        </Row>
      )}

      <Row>
        {!shouldConcealPrices && showBillingInfo && show_resource_limits && !hasManyRemoteProjects && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <ProjectDashboardCostLimits project={project} />
          </Col>
        )}
        {hasAnyRemoteProjects && remoteProjects && (
          <RemoteProjectDashboardCards
            remoteProjects={remoteProjects}
            customerEmail={customer?.email}
          />
        )}
        {hasAnyManagedProjects && managedProjects && (
          <ManagedProjectDashboardCards
            managedProjects={managedProjects}
            project={project}
          />
        )}
        {!hasManyRemoteProjects && !hasAnyManagedProjects && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <ProjectDashboardBalance project={project} className="mb-5" />
          </Col>
        )}
        {!hasAnyRemoteProjects && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <TeamWidget
              api={() =>
                projectsListUsersList({
                  path: { uuid: project.uuid },
                  query: {
                    field: [
                      'user_uuid',
                      'user_full_name',
                      'user_email',
                      'user_image',
                      'role_name',
                    ],
                    page_size: 5,
                  },
                }).then(parseSelectData)
              }
              scope={project}
              chartData={teamData}
              showChart
              onBadgeClick={isProjectRemoved ? undefined : goToUsers}
              onAddClick={isProjectRemoved ? undefined : handleAddClick}
              showAdd={(canInvite || membershipLocked) && !isProjectRemoved}
              loadingAdd={loadingProjects}
              className="h-100"
              nameKey="user_full_name"
              emailKey="user_email"
              imageKey="user_image"
            />
          </Col>
        )}
        {shouldShowCurrentMonthWidget && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <AggregateLimitWidget
              project={project}
              data={currentMonthFilteredData}
              isLoading={isAggregateLimitLoadingForCurrentMonth}
              error={aggregateLimitErrorForCurrentMonth}
              refetch={aggregateLimitRefetchForCurrentMonth}
              type="monthly"
            />
          </Col>
        )}
        {shouldShowAggregateLimitWidget && (
          <Col md={6} sm={12} className="mb-5" style={COMMON_WIDGET_HEIGHT}>
            <AggregateLimitWidget
              project={project}
              data={aggregateLimitData}
              isLoading={isAggregateLimitLoading}
              error={aggregateLimitError}
              refetch={aggregateLimitRefetch}
            />
          </Col>
        )}
        {showBillingInfo && !hasManyRemoteProjects && (
          <ProjectDashboardCredit project={project} className="mb-5" />
        )}
      </Row>
      {(project.description || project.staff_notes) && (
        <Row>
          {project.description && (
            <Col
              md={project.staff_notes ? 6 : 12}
              className="mb-5"
              style={COMMON_WIDGET_HEIGHT}
            >
              <Panel
                title={translate('Description')}
                actions={
                  canEditProject && (
                    <EditButton
                      onClick={handleEditDescription}
                      size="sm"
                      tooltip={translate('Edit description')}
                    />
                  )
                }
                cardBordered
                className="h-100"
              >
                <TruncatedMarkdown
                  text={project.description}
                  title={translate('Description')}
                  maxHeight={120}
                />
              </Panel>
            </Col>
          )}
          {project.staff_notes && (user.is_staff || user.is_support) && (
            <Col
              md={project.description ? 6 : 12}
              className="mb-5"
              style={COMMON_WIDGET_HEIGHT}
            >
              <Panel
                title={
                  <>
                    {translate('Staff Notes')}{' '}
                    <Badge variant="warning" light={true} outline={true}>
                      {translate('Internal')}
                    </Badge>
                  </>
                }
                actions={
                  user.is_staff && (
                    <EditButton
                      onClick={handleEditStaffNotes}
                      size="sm"
                      tooltip={translate('Edit staff notes')}
                    />
                  )
                }
                cardBordered
                className="h-100"
              >
                <TruncatedMarkdown
                  text={project.staff_notes}
                  title={translate('Staff Notes')}
                  maxHeight={120}
                  showInternalBadge={true}
                />
              </Panel>
            </Col>
          )}
        </Row>
      )}
    </>
  );
};
