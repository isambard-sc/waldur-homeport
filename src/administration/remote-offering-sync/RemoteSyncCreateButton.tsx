import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const RemoteSyncFormDialog = lazyComponent(() =>
  import('./RemoteSyncFormDialog').then((module) => ({
    default: module.RemoteSyncFormDialog,
  })),
);

export const RemoteSyncCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  return (
    <AddButton
      action={() =>
        dispatch(
          openModalDialog(RemoteSyncFormDialog, {
            refetch,
            size: 'lg',
          }),
        )
      }
    />
  );
};
