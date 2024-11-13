import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackBackupSummary = lazyComponent(() =>
  import('./OpenStackBackupSummary').then((module) => ({
    default: module.OpenStackBackupSummary,
  })),
);

export const OpenStackBackupSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.Backup',
    component: OpenStackBackupSummary,
  };
