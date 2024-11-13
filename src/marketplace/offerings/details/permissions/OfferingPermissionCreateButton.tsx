import { PlusCircle } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const OfferingPermissionCreateDialog = lazyComponent(() =>
  import('./OfferingPermissionCreateDialog').then((module) => ({
    default: module.OfferingPermissionCreateDialog,
  })),
);

export const OfferingPermissionCreateButton: React.FC<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(OfferingPermissionCreateDialog, {
        resolve: { offering, refetch },
      }),
    );
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Add user')}
      iconNode={<PlusCircle />}
      variant="primary"
    />
  );
};
