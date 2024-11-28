import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import * as api from '@waldur/customer/payments/api';
import { ADD_PAYMENT_FORM_ID } from '@waldur/customer/payments/constants';
import {
  FileUploadField,
  FormContainer,
  NumberField,
  SubmitButton,
} from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { updatePaymentsList } from './utils';

interface PaymentCreateDialogProps extends InjectedFormProps {
  resolve: {
    profileUrl: string;
  };
}

const PaymentCreateDialog: FunctionComponent<PaymentCreateDialogProps> = (
  props,
) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);

  const submitRequest = async (formData) => {
    try {
      await api.createPayment({
        date_of_payment: formatDate(formData.date_of_payment),
        sum: formData.sum,
        proof: formData.proof,
        profile: props.resolve.profileUrl,
      });
      dispatch(showSuccess(translate('Payment has been created.')));
      dispatch(closeModalDialog());
      dispatch(updatePaymentsList(customer));
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to create payment.')),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Add payment')}
        footer={
          <>
            <CloseDialogButton className="me-3" />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </>
        }
      >
        <div style={{ paddingBottom: '50px' }}>
          <FormContainer submitting={false} clearOnUnmount={false}>
            <DateField
              name="date_of_payment"
              label={translate('Date')}
              required
            />

            <NumberField name="sum" label={translate('Sum')} required />

            <FileUploadField
              name="proof"
              label={translate('Proof')}
              showFileName={true}
              buttonLabel={translate('Browse')}
            />
          </FormContainer>
        </div>
      </ModalDialog>
    </form>
  );
};

export const PaymentCreateDialogContainer = reduxForm({
  form: ADD_PAYMENT_FORM_ID,
})(PaymentCreateDialog);
