import { useDispatch, useSelector } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';
import { getCustomer } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

const OfferingCreateDialog = lazyComponent(() =>
  import('../actions/OfferingCreateDialog').then((module) => ({
    default: module.OfferingCreateDialog,
  })),
);

export const CreateOfferingButton = ({
  fetch,
  className,
}: {
  fetch?;
  className?;
}) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useUser() as User;

  const callback = () => {
    dispatch(openModalDialog(OfferingCreateDialog, { resolve: { fetch } }));
  };

  if (
    customer?.is_service_provider &&
    hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING,
      customerId: customer.uuid,
    })
  ) {
    return <AddButton action={callback} className={className} />;
  } else {
    return null;
  }
};
