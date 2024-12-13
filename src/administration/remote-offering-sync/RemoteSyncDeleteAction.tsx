import { Trash } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { removeRemoteSync } from './api';
import { RemoteSyncActionProps } from './types';

export const RemoteSyncDeleteAction = (props: RemoteSyncActionProps) => {
  const dispatch = useDispatch();

  const { mutate, isLoading } = useMutation(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete remote synchronization'),
        translate(
          'You are about to delete {connection} synchronisation. This action cannot be undone.',
          { connection: <strong>{props.row.api_url}</strong> },
          formatJsxTemplate,
        ),
        true,
      );
    } catch {
      return;
    }
    try {
      await removeRemoteSync(props.row.uuid);
      dispatch(showSuccess(translate('Remote synchronization deleted')));
      props.refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to delete remote synchronization.'),
        ),
      );
    }
  });

  return (
    <ActionItem
      title={translate('Delete')}
      className="text-danger"
      iconColor="danger"
      action={mutate}
      iconNode={<Trash />}
      disabled={isLoading}
    />
  );
};
