import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackSnapshotSummary = lazyComponent(
  () => import('./OpenStackSnapshotSummary'),
  'OpenStackSnapshotSummary',
);

export const OpenStackSnapshotSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.Snapshot',
    component: OpenStackSnapshotSummary,
  };
