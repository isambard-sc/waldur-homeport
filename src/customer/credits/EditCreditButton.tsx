import { PencilSimple } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { SubmissionError } from 'redux-form';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { updateCustomerCredit } from './api';
import { serializeCustomerCredit } from './utils';

const CreditFormDialog = lazyComponent(() =>
  import('./CreditFormDialog').then((module) => ({
    default: module.CreditFormDialog,
  })),
);

export const EditCreditButton = ({ row, refetch }) => {
  const { closeDialog, openDialog } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();

  const callback = async (formData) => {
    const payload = serializeCustomerCredit(formData);
    try {
      await updateCustomerCredit(row.uuid, payload);
      showSuccess(translate('Credit has been updated.'));
      closeDialog();
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to edit the credit'));
      if (e.response && e.response.status === 400) {
        throw new SubmissionError(e.response.data);
      }
    }
  };
  const openCreditFormDialog = () =>
    openDialog(CreditFormDialog, {
      size: 'lg',
      form: 'CustomerCreditEditForm',
      initialValues: {
        value: row.value,
        customer: {
          uuid: row.customer_uuid,
          name: row.customer_name,
          url: row.customer,
        },
        offerings: row.offerings,
        end_date: row.end_date,
        minimal_consumption_logic: row.minimal_consumption_logic,
        expected_consumption: row.expected_consumption,
        grace_coefficient: row.grace_coefficient,
        apply_as_minimal_consumption: row.apply_as_minimal_consumption,
      },
      onSubmit: callback,
    });

  return (
    <Dropdown.Item as="button" onClick={openCreditFormDialog}>
      <span className="svg-icon svg-icon-2">
        <PencilSimple weight="bold" />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};
