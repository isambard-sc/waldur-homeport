import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

import { ACTIVE, DRAFT, PAUSED } from '../../store/constants';

const UpdateOfferingLogoDialog = lazyComponent(() =>
  import('../../actions/UpdateOfferingLogoDialog').then((module) => ({
    default: module.UpdateOfferingLogoDialog,
  })),
);

export const OfferingLogoButton: FC<{ offering; refetch }> = (props) => {
  const user = useUser() as User;
  const customer = useSelector(getCustomer);

  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(UpdateOfferingLogoDialog, {
        resolve: props,
      }),
    );
  if (
    user.is_staff ||
    ([DRAFT, ACTIVE, PAUSED].includes(props.offering.state) &&
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_OFFERING_THUMBNAIL,
        customerId: customer.uuid,
      }))
  )
    return <EditButton onClick={callback} size="sm" />;
  return null;
};
