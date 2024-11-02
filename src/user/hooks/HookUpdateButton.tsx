import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { EditButton } from '@waldur/form/EditButton';
import { translate } from '@waldur/i18n';

import { showHookUpdateDialog } from './actions';

interface HookUpdateButtonProps {
  row: any;
}

export const HookUpdateButton: FC<HookUpdateButtonProps> = ({ row }) => {
  const dispatch = useDispatch();
  return (
    <EditButton
      title={translate('Update')}
      onClick={() => {
        dispatch(showHookUpdateDialog(row));
      }}
      size="sm"
    />
  );
};
