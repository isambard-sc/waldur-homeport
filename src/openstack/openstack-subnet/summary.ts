import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackSubNetSummary = lazyComponent(
  () => import('./OpenStackSubNetSummary'),
  'OpenStackSubNetSummary',
);

export const OpenStackSubNetSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.SubNet',
    component: OpenStackSubNetSummary,
  };
