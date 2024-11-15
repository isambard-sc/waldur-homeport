import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { required } from '@waldur/core/validators';
import * as api from '@waldur/customer/payment-profiles/api';
import { ADD_PAYMENT_PROFILE_FORM_ID } from '@waldur/customer/payment-profiles/constants';
import { getPaymentProfileTypeOptions } from '@waldur/customer/payment-profiles/utils';
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
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer } from '@waldur/workspace/selectors';

const PaymentProfileCreate = (props) => {
  const [isFixedPrice, setIsFixedPrice] = useState(false);
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);

  const paymentProfileTypeOptions = useMemo(
    () => getPaymentProfileTypeOptions(),
    [],
  );

  const addPaymentProfile = async (formData) => {
    try {
      const paymentProfile = await api.createPaymentProfile({
        is_active: false,
        name: formData.name,
        organization: customer.url,
        payment_type: formData.payment_type.value,
        attributes: {
          end_date: formData.end_date,
          agreement_number: formData.agreement_number,
          contract_sum: formData.contract_sum,
        },
      });
      if (paymentProfile?.uuid && formData.enabled) {
        await api.enablePaymentProfile(paymentProfile.uuid);
      }
      dispatch(
        showSuccess(
          formData.enabled
            ? translate('Payment profile has been created and enabled.')
            : translate('Payment profile has been created.'),
        ),
      );
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
      await props.resolve.refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to create payment profile.'),
        ),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(addPaymentProfile)}>
      <ModalDialog
        title={translate('Add payment profile')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Submit')}
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

          <Field
            name="enabled"
            component={(prop) => (
              <AwesomeCheckbox
                label={translate('Enable profile after creation')}
                {...prop.input}
              />
            )}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

const enhance = reduxForm({
  form: ADD_PAYMENT_PROFILE_FORM_ID,
});

export const PaymentProfileCreateDialog = enhance(PaymentProfileCreate);
