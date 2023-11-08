import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { sendBroadcast } from './api';

export const BroadcastSendButton = ({ broadcast, refetch }) => {
  const dispatch = useDispatch();

  const callback = async () => {
    try {
      await sendBroadcast(broadcast.uuid);
      await refetch();
      dispatch(showSuccess(translate('Broadcast has been sent.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to send broadcast.')));
    }
  };
  return (
    <Button onClick={callback} variant="light">
      <i className="fa fa-send" /> {translate('Send')}
    </Button>
  );
};
