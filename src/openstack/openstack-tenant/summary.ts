import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackTenantSummary = lazyComponent(
  () => import('./OpenStackTenantSummary'),
  'OpenStackTenantSummary',
);

const OpenStackRouterSummary = lazyComponent(
  () => import('./OpenStackRouterSummary'),
  'OpenStackRouterSummary',
);

export const OpenStackTenantSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.Tenant',
    component: OpenStackTenantSummary,
    standalone: true,
  };

export const OpenStackRouterSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.Router',
    component: OpenStackRouterSummary,
  };
