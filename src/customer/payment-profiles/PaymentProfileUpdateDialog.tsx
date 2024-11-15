import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import * as api from '@waldur/customer/payment-profiles/api';
import { EDIT_PAYMENT_PROFILE_FORM_ID } from '@waldur/customer/payment-profiles/constants';
import {
  getInitialValues,
  getPaymentProfileTypeOptions,
} from '@waldur/customer/payment-profiles/utils';
import {
  FormContainer,
  NumberField,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getCustomer as getCustomerApi } from '@waldur/project/api';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

const PaymentProfileUpdateDialog: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    props.initialize(getInitialValues(props.resolve.profile));
  }, [props.resolve.profile]);

  const [isFixedPrice, setIsFixedPrice] = useState(
    props.resolve.payment_type === 'fixed_price',
  );

  const paymentProfileTypeOptions = useMemo(
    () => getPaymentProfileTypeOptions(),
    [],
  );

  const customer = useSelector(getCustomer);

  const submitRequest = async (formData) => {
    try {
      await api.updatePaymentProfile(props.resolve.profile.uuid, formData);
      dispatch(showSuccess(translate('Payment profile has been updated.')));
      dispatch(closeModalDialog());
      await props.resolve.refetch();
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to update payment profile.'),
        ),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Update payment profile')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Update')}
            />
          </>
        }
      >
        <FormContainer submitting={false} clearOnUnmount={false}>
          <StringField
            name="name"
            label={translate('Name')}
            required={true}
            validate={required}
            maxLength={150}
          />

          <SelectField
            name="payment_type"
            label={translate('Type')}
            required={true}
            options={paymentProfileTypeOptions}
            isClearable={false}
            validate={required}
            onChange={(value: any) =>
              setIsFixedPrice(value.value === 'fixed_price')
            }
          />

          {isFixedPrice ? (
            <DateField name="end_date" label={translate('End date')} />
          ) : null}

          {isFixedPrice && (
            <TextField
              name="agreement_number"
              label={translate('Agreement number')}
              maxLength={150}
            />
          )}

          {isFixedPrice && (
            <NumberField
              name="contract_sum"
              label={translate('Contract sum')}
            />
          )}
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

export const PaymentProfileUpdateDialogContainer = reduxForm({
  form: EDIT_PAYMENT_PROFILE_FORM_ID,
})(PaymentProfileUpdateDialog);
