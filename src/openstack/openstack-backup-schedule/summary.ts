import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const OpenStackBackupScheduleSummary = lazyComponent(
  () => import('./OpenStackBackupScheduleSummary'),
  'OpenStackBackupScheduleSummary',
);

export const OpenStackBackupScheduleSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'OpenStack.BackupSchedule',
    component: OpenStackBackupScheduleSummary,
  };
