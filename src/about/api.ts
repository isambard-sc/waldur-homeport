import { get } from '@waldur/core/api';

export async function getUserAgreement(agreement_type) {
  const response = await get('/user-agreements/', {
    params: { agreement_type },
  });
  return response.data[0];
}
