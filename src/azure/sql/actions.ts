import { ActionConfiguration } from '@waldur/resource/actions/types';

import { DestroyServerAction } from './DestroyServerAction';

export const AzureSqlServerActions: ActionConfiguration = {
  type: 'Azure.SQLServer',
  actions: [DestroyServerAction],
};
