import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { activateRemoteSync } from './api';
import { RemoteSyncActionProps } from './types';

export const RemoteSyncEnableAction = (props: RemoteSyncActionProps) => {
  const dispatch = useDispatch();

  const { mutate, isLoading } = useMutation(async () => {
    try {
      await activateRemoteSync(!props.row.is_active, props.row.uuid);
      dispatch(
        showSuccess(
          props.row.is_active
            ? translate('Remote synchronization disabled')
            : translate('Remote synchronization enabled'),
        ),
      );
      props.refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          props.row.is_active
            ? translate('Unable to disable remote synchronization')
            : translate('Unable to enable remote synchronization'),
        ),
      );
    }
  });

  return (
    <ActionItem
      title={props.row.is_active ? translate('Disable') : translate('Enable')}
      action={mutate}
      iconNode={props.row.is_active ? <XCircle /> : <CheckCircle />}
      disabled={isLoading}
    />
  );
};
