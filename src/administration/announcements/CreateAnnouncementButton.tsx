import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const AnnouncementCreateDialog = lazyComponent(() =>
  import('./AnnouncementFormDialog').then((module) => ({
    default: module.AnnouncementFormDialog,
  })),
);

export const AnnouncementCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(AnnouncementCreateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
        },
        size: 'lg',
      }),
    );
  return <AddButton action={callback} />;
};
