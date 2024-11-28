import { DestroyServerGroupAction } from '@waldur/openstack/openstack-server-groups/DestroyServerGroupAction';
import { ActionConfiguration } from '@waldur/resource/actions/types';

import { PullServerGroupAction } from './PullServerGroupAction';

export const OpenStackServerGroupActions: ActionConfiguration = {
  type: 'OpenStack.ServerGroup',
  actions: [PullServerGroupAction, DestroyServerGroupAction],
};
