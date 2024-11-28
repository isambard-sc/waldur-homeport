import { ENV } from '@waldur/configs/default';
import { deleteById, getAll, post, sendForm } from '@waldur/core/api';
import { Payment } from '@waldur/workspace/types';

export const getTotalOfSumPaid = (profileUuid: string) => {
  const params = {
    profile_uuid: profileUuid,
  };
  return getAll<Payment>('/payments/', { params }).then((response: any) =>
    response.length
      ? response.reduce((a, b) => parseInt(a.sum) + parseInt(b.sum))
      : '0',
  );
};

export const createPayment = (data) =>
  sendForm('POST', `${ENV.apiEndpoint}api/payments/`, data);

export const updatePayment = (uuid, data) =>
  sendForm('PATCH', `${ENV.apiEndpoint}api/payments/${uuid}/`, data);

export const deletePayment = (uuid: string) => deleteById('/payments/', uuid);

export const linkInvoice = (payload: {
  paymentUuid: string;
  invoiceUrl: string;
}) =>
  post(`/payments/${payload.paymentUuid}/link_to_invoice/`, {
    invoice: payload.invoiceUrl,
  });

export const unlinkInvoice = (payload: { paymentUuid: string }) =>
  post(`/payments/${payload.paymentUuid}/unlink_from_invoice/`);
