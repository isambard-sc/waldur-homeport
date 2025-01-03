import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const userHasCustomerPermission = (permission) => (state) =>
  hasPermission(getUser(state), {
    customerId: getCustomer(state).uuid,
    permission,
  });
