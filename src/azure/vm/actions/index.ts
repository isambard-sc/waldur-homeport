import { MoveResourceAction } from '@waldur/marketplace/resources/actions/MoveResourceAction';
import { ActionConfiguration } from '@waldur/resource/actions/types';

import { DestroyAction } from './DestroyAction';
import { PullAction } from './PullAction';
import { RestartAction } from './RestartAction';
import { StartAction } from './StartAction';
import { StopAction } from './StopAction';

export const AzureVirtualMachineActions: ActionConfiguration = {
  type: 'Azure.VirtualMachine',
  actions: [
    PullAction,
    StartAction,
    StopAction,
    RestartAction,
    MoveResourceAction,
    DestroyAction,
  ],
};
