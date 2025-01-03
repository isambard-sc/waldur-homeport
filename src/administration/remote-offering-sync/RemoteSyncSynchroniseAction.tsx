import { GearSix } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { synchroniseRemoteSync } from './api';
import { RemoteSyncActionProps } from './types';

export const RemoteSyncSynchroniseAction = (props: RemoteSyncActionProps) => {
  const dispatch = useDispatch();

  const { mutate, isLoading } = useMutation(async () => {
    try {
      await synchroniseRemoteSync(props.row.uuid);
      dispatch(showSuccess(translate('Synchronisation has been successful.')));
      props.refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to synchronise.')));
    }
  });

  return (
    <ActionItem
      title={translate('Synchronise')}
      action={mutate}
      iconNode={<GearSix />}
      disabled={isLoading}
    />
  );
};
