import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { EditButton } from '@waldur/form/EditButton';
import { translate } from '@waldur/i18n';

import { showHookUpdateDialog } from './actions';

export const HookUpdateButton: FC<{ refetch; hook }> = (props) => {
  const dispatch = useDispatch();
  return (
    <EditButton
      title={translate('Update')}
      onClick={() => {
        dispatch(showHookUpdateDialog(props));
      }}
      size="sm"
    />
  );
};
