import { Trash } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import * as api from '@waldur/customer/payment-profiles/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { getCustomer as getCustomerApi } from '@waldur/project/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

export const PaymentProfileDeleteButton = (props) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the payment profile?'),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await api.deletePaymentProfile(props.profile.uuid);
      dispatch(showSuccess(translate('Payment profile has been removed.')));
      dispatch(closeModalDialog());
      await props.refetch();
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to remove payment profile.'),
        ),
      );
    }
  };
  return (
    <RowActionButton
      title={translate('Delete')}
      action={openDialog}
      iconNode={<Trash />}
      size="sm"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
