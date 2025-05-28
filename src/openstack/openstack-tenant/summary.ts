import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackTenantSummary = lazyComponent(() =>
  import('./OpenStackTenantSummary').then((module) => ({
    default: module.OpenStackTenantSummary,
  })),
);

const OpenStackRouterSummary = lazyComponent(() =>
  import('./OpenStackRouterSummary').then((module) => ({
    default: module.OpenStackRouterSummary,
  })),
);

const OpenstackPortSummary = lazyComponent(() =>
  import('./OpenstackPortSummary').then((module) => ({
    default: module.OpenstackPortSummary,
  })),
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

export const OpenStackPortSummaryConfiguration: ResourceSummaryConfiguration = {
  type: 'OpenStack.Port',
  component: OpenstackPortSummary,
};
