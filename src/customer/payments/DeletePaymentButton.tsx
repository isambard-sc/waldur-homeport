import { Trash } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import * as api from '@waldur/customer/payments/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { updatePaymentsList } from './utils';

export const DeletePaymentButton = ({ payment }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  return (
    <ActionButton
      title={translate('Delete')}
      action={async () => {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate('Are you sure you want to delete the payment?'),
            true,
          );
        } catch {
          return;
        }
        try {
          await api.deletePayment(payment.uuid);
          dispatch(showSuccess(translate('Payment has been deleted.')));
          dispatch(closeModalDialog());
          dispatch(updatePaymentsList(customer));
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to delete payment.')),
          );
        }
      }}
      iconNode={<Trash />}
      disabled={!user.is_staff}
      tooltip={
        !user.is_staff
          ? translate('You must be staff to modify payments')
          : null
      }
    />
  );
};
