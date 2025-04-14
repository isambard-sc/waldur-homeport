import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const AccessSubnetForm = lazyComponent(() =>
  import('./AccessSubnetForm').then((module) => ({
    default: module.AccessSubnetForm,
  })),
);

export const AccessSubnetEditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(AccessSubnetForm, {
          refetch,
          row,
          size: 'md',
        }),
      ),
    [dispatch, row, refetch],
  );

  return <EditAction action={openFormDialog} />;
};
