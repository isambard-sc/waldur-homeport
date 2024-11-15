import { Play } from '@phosphor-icons/react';
import { useDispatch, useSelector } from 'react-redux';

import * as api from '@waldur/customer/payment-profiles/api';
import { translate } from '@waldur/i18n';
import { getCustomer as getCustomerApi } from '@waldur/project/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

export const PaymentProfileEnableButton = (props) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const callback = async () => {
    try {
      await api.enablePaymentProfile(props.profile.uuid);
      dispatch(showSuccess(translate('Payment profile has been enabled.')));
      await props.refetch();
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to enable payment profile.'),
        ),
      );
    }
  };
  if (props.profile.is_active) {
    return null;
  }
  return (
    <RowActionButton
      title={translate('Enable')}
      action={callback}
      iconNode={<Play />}
      size="sm"
      {...props.tooltipAndDisabledAttributes}
    />
  );
};
