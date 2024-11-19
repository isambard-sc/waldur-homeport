import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  MarketplaceFeatures,
  OpenstackFeatures,
  SlurmFeatures,
} from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import {
  countLexisLinks,
  countRobotAccounts,
  getResource,
  getResourceDetails,
  getResourceOffering,
} from '@waldur/marketplace/common/api';
import { PageBarTab } from '@waldur/navigation/types';
import { INSTANCE_TYPE, TENANT_TYPE } from '@waldur/openstack/constants';
import { getTabs } from '@waldur/resource/tabs/registry';
import { getResourceAccessEndpoints } from '@waldur/resource/utils';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';

export const getResourceTabs = ({
  resource,
  offering,
  scope,
  lexisLinksCount,
  robotAccountsCount,
}) => {
  // Generate tabs
  const tabs: PageBarTab[] = [];

  const endpoints = getResourceAccessEndpoints(resource, offering);
  if (offering.getting_started || endpoints.length > 0) {
    tabs.push({
      key: 'getting-started',
      title: translate('Getting started'),
      component: lazyComponent(() =>
        import('./GettingStartedCard').then((module) => ({
          default: module.GettingStartedCard,
        })),
      ),
    });
  }

  if (resource.offering_type === TENANT_TYPE && scope) {
    tabs.push({
      key: 'quotas',
      title: translate('Quotas'),
      component: lazyComponent(() =>
        import('./TenantMainComponent').then((module) => ({
          default: module.TenantMainComponent,
        })),
      ),
    });
  } else if (resource.offering_type === INSTANCE_TYPE && scope) {
    tabs.push({
      key: 'vm-details',
      title: translate('Details'),
      component: lazyComponent(() =>
        import('./openstack-instance/InstanceMainComponent').then((module) => ({
          default: module.InstanceMainComponent,
        })),
      ),
    });
  } else if (resource.offering_type === OFFERING_TYPE_BOOKING) {
    tabs.push({
      key: 'booking',
      title: translate('Booking'),
      component: lazyComponent(() =>
        import('./BookingMainComponent').then((module) => ({
          default: module.BookingMainComponent,
        })),
      ),
    });
  } else if (resource.offering_type === SLURM_PLUGIN && scope) {
    tabs.push({
      key: 'allocation-users',
      title: translate('Allocation users'),
      component: lazyComponent(() =>
        import('@waldur/slurm/details/AllocationUsersTable').then((module) => ({
          default: module.AllocationUsersTable,
        })),
      ),
    });
    const isSlurmJobsVisible = isFeatureVisible(SlurmFeatures.jobs);
    if (isSlurmJobsVisible) {
      tabs.push({
        key: 'jobs',
        title: translate('Jobs'),
        component: lazyComponent(() =>
          import('@waldur/slurm/details/AllocationJobsTable').then(
            (module) => ({
              default: module.AllocationJobsTable,
            }),
          ),
        ),
      });
    }
  }

  if (scope) {
    tabs.push(...getTabs(scope.resource_type));
  }

  if (lexisLinksCount) {
    tabs.push({
      key: 'lexis-links',
      title: translate('LEXIS links'),
      component: lazyComponent(() =>
        import('../lexis/LexisLinkCard').then((module) => ({
          default: module.LexisLinkCard,
        })),
      ),
    });
  }

  if (robotAccountsCount) {
    tabs.push({
      key: 'robot-accounts',
      title: translate('Robot accounts'),
      component: lazyComponent(() =>
        import('@waldur/marketplace/robot-accounts/RobotAccountCard').then(
          (module) => ({ default: module.RobotAccountCard }),
        ),
      ),
    });
  }

  if (resource.is_usage_based || resource.is_limit_based) {
    tabs.push({
      key: 'usage-history',
      title: translate('Usage'),
      component: lazyComponent(() =>
        import('./UsageCard').then((module) => ({ default: module.UsageCard })),
      ),
    });
  }

  const showIssues = hasSupport();
  if (showIssues) {
    tabs.push({
      key: 'tickets',
      title: translate('Tickets'),
      component: lazyComponent(() =>
        import('./ResourceIssuesCard').then((module) => ({
          default: module.ResourceIssuesCard,
        })),
      ),
    });
  }

  if (offering.resource_options?.order?.length) {
    tabs.push({
      key: 'resource-options',
      title: translate('Options'),
      component: lazyComponent(() =>
        import('../options/ResourceOptionsCard').then((module) => ({
          default: module.ResourceOptionsCard,
        })),
      ),
    });
  }

  if (offering.roles?.length > 0) {
    tabs.push({
      key: 'users',
      title: translate('Roles'),
      component: lazyComponent(() =>
        import('../users/ResourceUsersList').then((module) => ({
          default: module.ResourceUsersList,
        })),
      ),
    });
  }

  tabs.push({
    key: 'metadata',
    title: translate('Resource metadata'),
    children: [
      {
        key: 'resource-details',
        title: translate('Resource details'),
        component: lazyComponent(() =>
          import('./ResourceMetadataCard').then((module) => ({
            default: module.ResourceMetadataCard,
          })),
        ),
      },
      {
        key: 'activity',
        title: translate('Audit logs'),
        component: lazyComponent(() =>
          import('./ActivityCard').then((module) => ({
            default: module.ActivityCard,
          })),
        ),
      },
      {
        key: 'order-history',
        title: translate('Order history'),
        component: lazyComponent(() =>
          import('@waldur/marketplace/orders/list/ResourceOrders').then(
            (module) => ({
              default: module.ResourceOrders,
            }),
          ),
        ),
      },
    ],
  });

  if (
    resource.offering_type === TENANT_TYPE &&
    scope &&
    isFeatureVisible(OpenstackFeatures.show_migrations)
  ) {
    tabs.push({
      key: 'replications',
      title: translate('Replications'),
      component: lazyComponent(() =>
        import('@waldur/openstack/openstack-tenant/TenantMigrationsList').then(
          (module) => ({ default: module.TenantMigrationsList }),
        ),
      ),
    });
  }
  return tabs;
};

export const fetchData = async (resourceId) => {
  const resource = await getResource(resourceId);
  let scope;
  if (resource.scope) {
    scope = await getResourceDetails(resourceId);
  }
  const offering = await getResourceOffering(resource.uuid);
  const components = offering.components;

  let lexisLinksCount = 0;
  if (isFeatureVisible(MarketplaceFeatures.lexis_links)) {
    lexisLinksCount = await countLexisLinks({
      resource_uuid: resource.uuid,
    });
  }
  const robotAccountsCount = await countRobotAccounts({
    resource: resource.url,
  });

  return {
    resource,
    scope,
    components,
    offering,
    lexisLinksCount,
    robotAccountsCount,
  };
};
