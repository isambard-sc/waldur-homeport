import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { ADMIN_HOOK_LIST_ID } from './constants';

const HookDetailsDialog = lazyComponent(() =>
  import('@waldur/user/hooks/HookDetailsDialog').then((module) => ({
    default: module.HookDetailsDialog,
  })),
);

const showHookUpdateDialog = (row?) =>
  openModalDialog(HookDetailsDialog, {
    resolve: { hook: row, listId: ADMIN_HOOK_LIST_ID },
    size: 'md',
  });

interface HookUpdateButtonProps {
  row: any;
}

export const HookUpdateButton: FunctionComponent<HookUpdateButtonProps> = ({
  row,
}) => {
  const dispatch = useDispatch();
  return (
    <EditAction
      label={translate('Update')}
      action={() => dispatch(showHookUpdateDialog(row))}
      size="sm"
    />
  );
};
