import { Eye } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { UsersService, setImpersonationData } from '../UsersService';

export const UserImpersonateButton: FunctionComponent<{ row }> = ({ row }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  const { mutate, isLoading } = useMutation(async () => {
    try {
      setImpersonationData(row.uuid);
      await UsersService.getCurrentUser(true);
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to impersonate the user.')),
      );
    }
  });

  if (user?.uuid === row.uuid) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Impersonate')}
      action={mutate}
      iconNode={<Eye />}
      disabled={isLoading}
      size="sm"
    />
  );
};
