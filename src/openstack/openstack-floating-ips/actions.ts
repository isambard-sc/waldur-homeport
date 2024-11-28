import { ActionConfiguration } from '@waldur/resource/actions/types';

import { DestroyFloatingIpAction } from './DestroyFloatingIpAction';
import { PullFloatingIpAction } from './PullFloatingIpAction';

export const OpenStackFloatingIPActions: ActionConfiguration = {
  type: 'OpenStack.FloatingIP',
  actions: [PullFloatingIpAction, DestroyFloatingIpAction],
};
