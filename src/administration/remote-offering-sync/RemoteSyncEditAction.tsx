import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

import { RemoteSyncActionProps } from './types';

const RemoteSyncFormDialog = lazyComponent(() =>
  import('./RemoteSyncFormDialog').then((module) => ({
    default: module.RemoteSyncFormDialog,
  })),
);

export const RemoteSyncEditAction = ({
  row,
  refetch,
}: RemoteSyncActionProps) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RemoteSyncFormDialog, {
          remoteSync: row,
          refetch,
          size: 'lg',
        }),
      ),
    [dispatch],
  );

  return <EditAction action={openFormDialog} />;
};
