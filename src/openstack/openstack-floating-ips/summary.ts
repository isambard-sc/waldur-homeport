import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackFloatingIpSummary = lazyComponent(
  () => import('./OpenStackFloatingIpSummary'),
  'OpenStackFloatingIpSummary',
);

export const OpenStackFloatingIpSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.FloatingIP',
    component: OpenStackFloatingIpSummary,
  };
