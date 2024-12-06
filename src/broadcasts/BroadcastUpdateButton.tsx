import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { BroadcastResponseData } from './types';
import { parseBroadcast } from './utils';

const BroadcastUpdateDialog = lazyComponent(() =>
  import('./BroadcastUpdateDialog').then((module) => ({
    default: module.BroadcastUpdateDialog,
  })),
);

export const BroadcastUpdateButton: FunctionComponent<{
  row: BroadcastResponseData;
  refetch;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(BroadcastUpdateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          initialValues: parseBroadcast(row),
          uuid: row.uuid,
          refetch,
        },
        size: 'xl',
      }),
    );
  return <EditAction label={translate('Update')} action={callback} size="sm" />;
};
