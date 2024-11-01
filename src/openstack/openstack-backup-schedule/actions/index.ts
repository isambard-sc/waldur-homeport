import { ActionConfiguration } from '@waldur/resource/actions/types';

import { ActivateAction } from './ActivateAction';
import { DeactivateAction } from './DeactivateAction';
import { DestroyBackupScheduleAction } from './DestroyBackupScheduleAction';
import { EditAction } from './EditAction';

export const OpenStackBackupScheduleActions: ActionConfiguration = {
  type: 'OpenStack.BackupSchedule',
  actions: [
    EditAction,
    ActivateAction,
    DeactivateAction,
    DestroyBackupScheduleAction,
  ],
};
