import { SubmissionError } from 'redux-form';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { createCustomerCredit } from './api';
import { serializeCustomerCredit } from './utils';

const CreditFormDialog = lazyComponent(() =>
  import('./CreditFormDialog').then((module) => ({
    default: module.CreditFormDialog,
  })),
);

const FORM_ID = 'CustomerCreditCreateForm';

export const CreateCreditButton = ({ refetch }) => {
  const { closeDialog, openDialog } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();
  const callback = async (formData) => {
    const payload = serializeCustomerCredit(formData);
    try {
      await createCustomerCredit(payload);
      showSuccess(translate('Credit has been created.'));
      closeDialog();
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to create a credit'));
      if (e.response && e.response.status === 400) {
        throw new SubmissionError(e.response.data);
      }
    }
  };

  return (
    <AddButton
      action={() =>
        openDialog(CreditFormDialog, {
          size: 'lg',
          form: FORM_ID,
          formId: FORM_ID,
          onSubmit: callback,
        })
      }
    />
  );
};
