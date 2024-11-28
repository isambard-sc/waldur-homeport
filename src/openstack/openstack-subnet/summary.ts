import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackSubNetSummary = lazyComponent(() =>
  import('./OpenStackSubNetSummary').then((module) => ({
    default: module.OpenStackSubNetSummary,
  })),
);

export const OpenStackSubNetSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.SubNet',
    component: OpenStackSubNetSummary,
  };
