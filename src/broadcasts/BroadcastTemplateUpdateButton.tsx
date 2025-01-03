import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { openModalDialog } from '@waldur/modal/actions';

const BroadcastTemplateUpdateDialog = lazyComponent(() =>
  import('./BroadcastTemplateUpdateDialog').then((module) => ({
    default: module.BroadcastTemplateUpdateDialog,
  })),
);

export const BroadcastTemplateUpdateButton: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(BroadcastTemplateUpdateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: { template: row, refetch },
        size: 'lg',
      }),
    );
  };
  return <EditAction action={callback} size="sm" />;
};
