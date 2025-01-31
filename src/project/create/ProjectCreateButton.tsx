import { PlusCircle } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

const ProjectCreateDialog = lazyComponent(() =>
  import('./ProjectCreateDialog').then((module) => ({
    default: module.ProjectCreateDialog,
  })),
);

interface ProjectCreateButtonProps {
  customer?: Customer;
  refetch?;
  title?: string;
  iconNode?: ReactNode;
}

export const ProjectCreateButton: FC<ProjectCreateButtonProps> = (props) => {
  const currentCustomer = useSelector(getCustomer);
  const customer = props.customer || currentCustomer;
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
      title={props.title || translate('Add')}
      action={() =>
        dispatch(
          openModalDialog(ProjectCreateDialog, {
            size: 'lg',
            formId: 'projectCreate',
            customer,
            refetch: props.refetch,
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
      iconNode={props.iconNode || <PlusCircle />}
      variant="primary"
      disabled={disabled}
    />
  );
};
