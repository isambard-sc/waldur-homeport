import customerDetailsSaga from '@waldur/customer/details/store/effects';
import paymentProfilesSaga from '@waldur/customer/payment-profiles/store/effects';
import paymentsSaga from '@waldur/customer/payments/store/effects';
import marketplaceSaga from '@waldur/marketplace/store/effects';
import { effects as titleEffects } from '@waldur/navigation/title';
import { formActionSaga } from '@waldur/redux-form-saga';
import workspaceSaga from '@waldur/workspace/effects';

export default [
  formActionSaga,
  customerDetailsSaga,
  marketplaceSaga,
  paymentProfilesSaga,
  paymentsSaga,
  titleEffects,
  workspaceSaga,
];
