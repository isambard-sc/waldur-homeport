import { PlusCircle } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';
import type { User } from '@waldur/workspace/types';

const CreateImageDialog = lazyComponent(() =>
  import('./CreateImageDialog').then((module) => ({
    default: module.CreateImageDialog,
  })),
);

interface CreateImageButtonProps {
  offering: Offering;
}

export const CreateImageButton = (props: CreateImageButtonProps) => {
  const user = useUser() as User;
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(CreateImageDialog, {
        resolve: props,
        size: 'lg',
      }),
    );

  if (
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_OFFERING_SCREENSHOT,
      customerId: props.offering.customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <ActionButton
      title={translate('Add image')}
      iconNode={<PlusCircle />}
      action={callback}
    />
  );
};
