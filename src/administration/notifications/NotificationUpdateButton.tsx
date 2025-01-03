import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const NotificationUpdateDialog = lazyComponent(() =>
  import('./NotificationUpdateDialog').then((module) => ({
    default: module.NotificationUpdateDialog,
  })),
);

export const NotificationUpdateButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(NotificationUpdateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: { notification: row, refetch },
        size: 'xl',
      }),
    );
  };
  return <EditAction action={callback} size="sm" />;
};
