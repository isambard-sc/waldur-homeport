import { Share } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { sendBroadcast } from './api';

export const BroadcastSendButton = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await sendBroadcast(row.uuid);
      await refetch();
      dispatch(showSuccess(translate('Broadcast has been sent.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to send broadcast.')));
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Send')}
      iconNode={<Share />}
      size="sm"
    />
  );
};
