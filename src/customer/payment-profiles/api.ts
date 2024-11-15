import { deleteById, post, patch } from '@waldur/core/api';
import { PaymentProfile } from '@waldur/workspace/types';

export const createPaymentProfile = (formData) =>
  post<PaymentProfile>('/payment-profiles/', formData).then(
    (response) => response.data,
  );

export const updatePaymentProfile = (uuid, formData) => {
  const reqData = {
    name: formData.name,
    payment_type: formData.payment_type.value,
    attributes: {
      end_date: formData.end_date,
      agreement_number: formData.agreement_number,
      contract_sum: formData.contract_sum,
    },
  };
  return patch(`/payment-profiles/${uuid}/`, reqData).then(
    (response) => response.data,
  );
};

export const deletePaymentProfile = (uuid: string) =>
  deleteById('/payment-profiles/', uuid);

export const enablePaymentProfile = (uuid: string) =>
  post(`/payment-profiles/${uuid}/enable/`).then((response) => response.data);
