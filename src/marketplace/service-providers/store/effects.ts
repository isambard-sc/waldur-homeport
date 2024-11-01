import { put, takeEvery } from 'redux-saga/effects';

import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import * as actions from './actions';
import * as constants from './constants';

function* generateServiceProviderSecretCode(action) {
  const { serviceProvider } = action.payload;
  const successMessage = translate(
    'Service provider API secret code has been generated.',
  );
  const errorMessage = translate(
    'Unable to generate service provider API secret code.',
  );
  try {
    const data = yield api.generateServiceProviderSecretCode(
      serviceProvider.uuid,
    );
    yield put(actions.secretCodeRegenerateSuccess(data.api_secret_code));
    yield put(closeModalDialog());
    yield put(showSuccess(successMessage));
  } catch (error) {
    yield put(actions.secretCodeRegenerateError());
    yield put(closeModalDialog());
    yield put(showErrorResponse(error, errorMessage));
  }
}

function* getServiceProviderSecretCode(action) {
  const { serviceProvider } = action.payload;
  const errorMessage = translate(
    'Unable to get service provider API secret code.',
  );
  try {
    const data = yield api.getServiceProviderSecretCode(serviceProvider.uuid);
    const secretCode = data.api_secret_code ? data.api_secret_code : '';
    yield put(actions.secretCodeFetchSuccess(secretCode));
  } catch (error) {
    yield put(showErrorResponse(error, errorMessage));
  }
}

export default function* () {
  yield takeEvery(
    constants.SERVICE_PROVIDER_CODE_REGENERATE_START,
    generateServiceProviderSecretCode,
  );
  yield takeEvery(
    constants.SERVICE_PROVIDER_CODE_FETCH_START,
    getServiceProviderSecretCode,
  );
}
