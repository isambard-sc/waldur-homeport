import { ActionConfiguration } from '@waldur/resource/actions/types';

import { DestroySnapshotAction } from './DestroySnapshotAction';
import { EditAction } from './EditAction';
import { PullSnapshotAction } from './PullSnapshotAction';
import { RestoreSnapshotAction } from './RestoreSnapshotAction';

export const OpenStackSnapshotActions: ActionConfiguration = {
  type: 'OpenStack.Snapshot',
  actions: [
    EditAction,
    PullSnapshotAction,
    RestoreSnapshotAction,
    DestroySnapshotAction,
  ],
};
