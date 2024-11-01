import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const RancherNodeSummary = lazyComponent(
  () => import('./RancherNodeSummary'),
  'RancherNodeSummary',
);

export const RancherNodeSummaryConfiguration: ResourceSummaryConfiguration = {
  type: 'Rancher.Node',
  component: RancherNodeSummary,
};
