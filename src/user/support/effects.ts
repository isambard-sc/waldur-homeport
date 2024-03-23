import { SubmissionError } from 'redux-form';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/notify';
import { updateEntity } from '@waldur/table/actions';
import {
  updateUser,
  activateUser,
  deactivateUser,
} from '@waldur/user/support/actions';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';

import * as api from './api';

const USERS_TABLE = 'userList';

export function* handleUpdateUser(action) {
  const successMessage = translate('User has been updated');
  const errorMessage = translate('User could not been updated');

  try {
    const response = yield call(api.updateUser, action.payload);
    const user = response.data;

    const currentUser = yield select(getUser);
    if (user.uuid === currentUser.uuid) {
      yield put(setCurrentUser(user));
    }

    yield put(updateEntity(USERS_TABLE, user.uuid, user));
    yield put(updateUser.success());
    yield put(showSuccess(successMessage));
  } catch (error) {
    const errorData = error?.response?.data;
    const formError = new SubmissionError({
      _error: errorMessage,
      ...errorData,
    });
    yield put(updateUser.failure(formError));
  }
}

function* handleActivateUser(action) {
  try {
    yield call(api.activateUser, action.payload.uuid);
    const user = { ...action.payload, is_active: true };
    yield put(updateEntity(USERS_TABLE, user.uuid, user));
    yield put(activateUser.success());
    yield put(showSuccess(translate('User has been activated.')));
  } catch (error) {
    yield put(activateUser.failure());
    const errorMessage = `${translate('Unable to activate user.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

function* handleDeactivateUser(action) {
  try {
    yield call(api.deactivateUser, action.payload.uuid);
    const user = { ...action.payload, is_active: false };
    yield put(updateEntity(USERS_TABLE, user.uuid, user));
    yield put(activateUser.success());
    yield put(showSuccess(translate('User has been deactivated.')));
  } catch (error) {
    yield put(activateUser.failure());
    const errorMessage = `${translate('Unable to deactivate user.')} ${format(
      error,
    )}`;
    yield put(showError(errorMessage));
  }
}

export default function* userSaga() {
  yield takeEvery(updateUser.REQUEST, handleUpdateUser);
  yield takeEvery(activateUser.REQUEST, handleActivateUser);
  yield takeEvery(deactivateUser.REQUEST, handleDeactivateUser);
}
