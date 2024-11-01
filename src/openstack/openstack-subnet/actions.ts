import { ActionConfiguration } from '@waldur/resource/actions/types';

import { ConnectSubnetAction } from './ConnectSubnetAction';
import { DestroySubnetAction } from './DestroySubnetAction';
import { DisconnectSubnetAction } from './DisconnectSubnetAction';
import { EditSubnetAction } from './EditSubnetAction';
import { PullSubnetAction } from './PullSubnetAction';

export const OpenStackSubNetActions: ActionConfiguration = {
  type: 'OpenStack.SubNet',
  actions: [
    EditSubnetAction,
    ConnectSubnetAction,
    DisconnectSubnetAction,
    PullSubnetAction,
    DestroySubnetAction,
  ],
};
