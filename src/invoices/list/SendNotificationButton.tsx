import { Share } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

export const SendNotificationButton: FunctionComponent<{ row }> = ({ row }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();
  if (!user.is_staff) {
    return null;
  }

  const onClick = async () => {
    try {
      await post(`/invoices/${row.uuid}/send_notification/`);
      dispatch(
        showSuccess(
          translate(
            'Record notification has been sent to organization owners.',
          ),
        ),
      );
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to send record notification.')),
      );
    }
  };

  return (
    <ActionItem
      title={translate('Send notification')}
      action={onClick}
      iconNode={<Share weight="bold" />}
      disabled={row.state !== 'created'}
      tooltip={
        row.state !== 'created'
          ? translate('Notification can be sent only for created invoice.')
          : ''
      }
    />
  );
};
