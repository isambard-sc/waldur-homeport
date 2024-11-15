import { FunctionComponent, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn, useBoolean } from 'react-use';

import { getAll } from '@waldur/core/api';
import * as api from '@waldur/customer/payments/api';
import { InvoicesDropdown } from '@waldur/customer/payments/InvoicesDropdown';
import { translate } from '@waldur/i18n';
import { Invoice } from '@waldur/invoices/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { updatePaymentsList } from './utils';

const loadInvoices = (customer: Customer) =>
  getAll<Invoice[]>('/invoices/', {
    params: { customer: customer.url, state: 'paid' },
  });

export const LinkInvoiceAction: FunctionComponent<{ payment }> = ({
  payment,
}) => {
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const [{ loading, error, value }, getInvoices] = useAsyncFn(
    () => loadInvoices(customer),
    [customer],
  );

  const [open, onToggle] = useBoolean(false);

  const loadInvoicesIfOpen = useCallback(() => {
    open && getInvoices();
  }, [open, getInvoices]);

  useEffect(loadInvoicesIfOpen, [open]);

  const triggerAction = async (selectedInvoice: Invoice) => {
    try {
      await api.linkInvoice({
        paymentUuid: payment.uuid,
        invoiceUrl: selectedInvoice.url,
      });
      dispatch(
        showSuccess(
          translate('Invoice has been successfully linked to payment.'),
        ),
      );
      dispatch(updatePaymentsList(customer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to link invoice to the payment.'),
        ),
      );
    }
  };

  return (
    <InvoicesDropdown
      open={open}
      disabled={!user.is_staff}
      loading={loading}
      error={error}
      invoices={value}
      onToggle={onToggle}
      onSelect={triggerAction}
    />
  );
};
