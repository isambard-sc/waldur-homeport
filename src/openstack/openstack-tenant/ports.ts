import { ActionConfiguration } from '@waldur/resource/actions/types';

import { DestroyPortAction } from './DestroyPortAction';

export const OpenStackPortActions: ActionConfiguration = {
  type: 'OpenStack.Port',
  actions: [DestroyPortAction],
};
