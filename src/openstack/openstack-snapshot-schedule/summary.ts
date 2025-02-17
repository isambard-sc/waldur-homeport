import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackSnapshotScheduleSummary = lazyComponent(() =>
  import('./OpenStackSnapshotScheduleSummary').then((module) => ({
    default: module.OpenStackSnapshotScheduleSummary,
  })),
);

export const OpenStackSnapshotScheduleSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.SnapshotSchedule',
    component: OpenStackSnapshotScheduleSummary,
  };
