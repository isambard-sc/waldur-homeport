import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

const UpdateOfferingPermissionExpirationTimeDialog = lazyComponent(() =>
  import('./UpdateOfferingPermissionExpirationTimeDialog').then((module) => ({
    default: module.UpdateOfferingPermissionExpirationTimeDialog,
  })),
);

export const UpdateOfferingPermissionExpirationTimeButton: FunctionComponent<{
  permission;
  fetch;
}> = ({ permission, fetch }) => {
  const user = useUser();
  const customer = useSelector(getCustomer);
  const canUpdatePermission = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING_PERMISSION,
    customerId: customer.uuid,
  });

  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(UpdateOfferingPermissionExpirationTimeDialog, {
        resolve: { permission, fetch },
      }),
    );
  };
  return canUpdatePermission ? (
    <EditButton onClick={callback} size="sm" />
  ) : null;
};
