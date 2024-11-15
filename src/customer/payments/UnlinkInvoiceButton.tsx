import { FileText } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import * as api from '@waldur/customer/payments/api';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { updatePaymentsList } from './utils';

export const UnlinkInvoiceButton = ({ payment }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const callback = async () => {
    try {
      await api.unlinkInvoice(payment.uuid);
      dispatch(
        showSuccess(
          translate('Invoice has been successfully unlinked from payment.'),
        ),
      );
      dispatch(updatePaymentsList(customer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to unlink invoice from the payment.'),
        ),
      );
    }
  };

  return (
    <ActionButton
      title={translate('Unlink invoice')}
      action={callback}
      iconNode={<FileText />}
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
