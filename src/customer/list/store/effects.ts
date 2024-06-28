import { triggerTransition } from '@uirouter/redux';
import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import * as api from '@waldur/customer/list/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { fetchListStart } from '@waldur/table/actions';

import * as constants from '../constants';

function* organizationUpdate(action) {
  try {
    const { ...payload } = action.payload;
    yield call(api.updateOrganization, payload);
    yield put(
      showSuccess(translate('Organization has been updated successfully.')),
    );
    yield put(triggerTransition('organizations', {}));
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to update organization.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

function* organizationLocation(action) {
  try {
    yield call(api.updateOrganization, action.payload);
    yield put(showSuccess(translate('Location has been saved successfully.')));
    yield put(closeModalDialog());
    yield put(fetchListStart(constants.SUPPORT_CUSTOMER_LIST));
  } catch (error) {
    const errorMessage = `${translate('Unable to save location.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(constants.UPDATE_ORGANIZATION, organizationUpdate);
  yield takeEvery(constants.SET_ORGANIZATION_LOCATION, organizationLocation);
}
