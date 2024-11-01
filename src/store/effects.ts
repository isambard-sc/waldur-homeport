import customerDetailsSaga from '@waldur/customer/details/store/effects';
import organizationsSaga from '@waldur/customer/list/store/effects';
import paymentProfilesSaga from '@waldur/customer/payment-profiles/store/effects';
import paymentsSaga from '@waldur/customer/payments/store/effects';
import marketplaceSaga from '@waldur/marketplace/store/effects';
import { effects as titleEffects } from '@waldur/navigation/title';
import projectSaga from '@waldur/project/effects';
import { formActionSaga } from '@waldur/redux-form-saga';
import userSaga from '@waldur/user/support/effects';
import workspaceSaga from '@waldur/workspace/effects';

export default [
  formActionSaga,
  projectSaga,
  userSaga,
  customerDetailsSaga,
  marketplaceSaga,
  paymentProfilesSaga,
  organizationsSaga,
  paymentsSaga,
  titleEffects,
  workspaceSaga,
];
