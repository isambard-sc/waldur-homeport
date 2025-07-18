import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { BroadcastMessage } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { parseBroadcast } from './utils';

const BroadcastUpdateDialog = lazyComponent(() =>
  import('./BroadcastFormDialog').then((module) => ({
    default: module.BroadcastFormDialog,
  })),
);

export const BroadcastUpdateButton: FunctionComponent<{
  row: BroadcastMessage;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(BroadcastUpdateDialog, {
        dialogClassName: 'modal-dialog-centered',
        initialValues: parseBroadcast(row),
        resolve: {
          uuid: row.uuid,
          refetch,
        },
        size: 'xl',
      }),
    );
  return <EditAction label={translate('Update')} action={callback} size="sm" />;
};
