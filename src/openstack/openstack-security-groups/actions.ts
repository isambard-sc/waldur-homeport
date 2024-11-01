import { ActionConfiguration } from '@waldur/resource/actions/types';

import { DestroySecurityGroupAction } from './DestroySecurityGroupAction';
import { EditAction } from './EditAction';
import { PullSecurityGroupAction } from './PullSecurityGroupAction';
import { SetRulesAction } from './SetRulesAction';

export const OpenStackSecurityGroupActions: ActionConfiguration = {
  type: 'OpenStack.SecurityGroup',
  actions: [
    EditAction,
    SetRulesAction,
    DestroySecurityGroupAction,
    PullSecurityGroupAction,
  ],
};
