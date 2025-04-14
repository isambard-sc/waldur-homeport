import { customersRetrieve } from 'waldur-js-client';

import { hasPermission } from '@waldur/permissions/hasPermission';
import {
  getCustomer as getCustomerSelector,
  getUser,
} from '@waldur/workspace/selectors';

export const userHasCustomerPermission = (permission) => (state) =>
  hasPermission(getUser(state), {
    customerId: getCustomerSelector(state).uuid,
    permission,
  });

export const getCustomer = (customerId: string) =>
  customersRetrieve({ path: { uuid: customerId } }).then((r) => r.data);
