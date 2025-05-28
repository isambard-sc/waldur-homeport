import {
  customersRetrieve,
  CustomersRetrieveData,
  Options,
} from 'waldur-js-client';

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

export const getCustomer = (
  customerId: string,
  field: Options<CustomersRetrieveData, false>['query']['field'] = null,
) =>
  customersRetrieve({
    path: { uuid: customerId },
    ...(field ? { query: { field } } : {}),
  }).then((r) => r.data);
