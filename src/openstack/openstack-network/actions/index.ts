import { ActionConfiguration } from '@waldur/resource/actions/types';

import { CreateSubnetAction } from './CreateSubnetAction';
import { DestroyNetworkAction } from './DestroyNetworkAction';
import { EditNetworkAction } from './EditNetworkAction';
import { PullNetworkAction } from './PullNetworkAction';
import { SetMtuAction } from './SetMtuAction';

export const OpenStackNetworkActions: ActionConfiguration = {
  type: 'OpenStack.Network',
  actions: [
    EditNetworkAction,
    PullNetworkAction,
    CreateSubnetAction,
    SetMtuAction,
    DestroyNetworkAction,
  ],
};
