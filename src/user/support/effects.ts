import { SubmissionError } from 'redux-form';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { queryClient } from '@waldur/Application';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';
import { updateEntity } from '@waldur/table/actions';
import { updateUser } from '@waldur/user/support/actions';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';

import * as api from './api';

const USERS_TABLE = 'userList';

export function* handleUpdateUser(action) {
  const successMessage = translate('User has been updated');
  const errorMessage = translate('User could not be updated');

  try {
    const { uuid, ...values } = action.payload;
    const response = yield call(api.updateUser, uuid, values);
    const user = response.data;

    const currentUser = yield select(getUser);
    if (user.uuid === currentUser.uuid) {
      yield put(setCurrentUser(user));
    }

    yield put(updateEntity(USERS_TABLE, user.uuid, user));
    queryClient.setQueryData(['UserDetails', user.uuid], user);
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

export default function* userSaga() {
  yield takeEvery(updateUser.REQUEST, handleUpdateUser);
}
