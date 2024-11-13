import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackNetworkSummary = lazyComponent(() =>
  import('./OpenStackNetworkSummary').then((module) => ({
    default: module.OpenStackNetworkSummary,
  })),
);

export const OpenStackNetworkSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.Network',
    component: OpenStackNetworkSummary,
  };
