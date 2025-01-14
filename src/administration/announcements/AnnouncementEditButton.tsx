import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const AnnouncementFormDialog = lazyComponent(() =>
  import('./AnnouncementFormDialog').then((module) => ({
    default: module.AnnouncementFormDialog,
  })),
);

export const AnnouncementEditButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AnnouncementFormDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: { announcement: row, refetch },
        size: 'lg',
      }),
    );
  };
  return <EditAction action={callback} size="sm" />;
};
