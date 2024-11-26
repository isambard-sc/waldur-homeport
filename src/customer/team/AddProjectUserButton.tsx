import { PlusCircle } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionButton } from '@waldur/table/ActionButton';

import { NestedCustomerPermission } from './types';

const AddProjectUserDialog = lazyComponent(() =>
  import('./AddProjectUserDialog').then((module) => ({
    default: module.AddProjectUserDialog,
  })),
);

interface AddProjectUserButtonProps {
  customer: NestedCustomerPermission;
  refetch;
  asDropdownItem?: boolean;
}

export const AddProjectUserButton: React.FC<AddProjectUserButtonProps> = ({
  customer,
  refetch,
  asDropdownItem,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(AddProjectUserDialog, {
        resolve: {
          customer,
          refetch,
        },
      }),
    );
  return asDropdownItem ? (
    <ActionItem
      title={translate('Add project role')}
      action={callback}
      iconNode={<PlusCircle weight="bold" />}
    />
  ) : (
    <ActionButton
      action={callback}
      title={translate('Add')}
      iconNode={<PlusCircle />}
    />
  );
};
