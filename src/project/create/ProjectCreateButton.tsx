import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const ProjectCreateDialog = lazyComponent(
  () => import('./ProjectCreateDialog'),
  'ProjectCreateDialog',
);

export const ProjectCreateButton: FC<{ refetch? }> = ({ refetch }) => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const disabled =
    !customer ||
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT,
      customerId: customer.uuid,
    });
  const dispatch = useDispatch();
  return (
    <ActionButton
      title={translate('Add')}
      action={() =>
        dispatch(
          openModalDialog(ProjectCreateDialog, {
            size: 'lg',
            formId: 'projectCreate',
            customer,
            refetch,
          }),
        )
      }
      tooltip={
        disabled
          ? translate(
              "You don't have enough privileges to perform this operation.",
            )
          : undefined
      }
      iconNode={<PlusCircle />}
      variant="primary"
      disabled={disabled}
    />
  );
};
