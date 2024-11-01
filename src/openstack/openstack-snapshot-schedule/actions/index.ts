import { ActionConfiguration } from '@waldur/resource/actions/types';

import { ActivateSnapshotScheduleAction } from './ActivateSnapshotScheduleAction';
import { DeactivateSnapshotScheduleAction } from './DeactivateSnapshotScheduleAction';
import { DestroySnapshotScheduleAction } from './DestroySnapshotScheduleAction';
import { EditAction } from './EditAction';

export const OpenStackSnapshotScheduleActions: ActionConfiguration = {
  type: 'OpenStack.SnapshotSchedule',
  actions: [
    EditAction,
    ActivateSnapshotScheduleAction,
    DeactivateSnapshotScheduleAction,
    DestroySnapshotScheduleAction,
  ],
};
