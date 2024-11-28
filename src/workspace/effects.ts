import { call, put, select, takeEvery } from 'redux-saga/effects';

import {
  clearImpersonationData,
  getCurrentUser,
  setImpersonationData,
} from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getImpersonatorUser } from '@waldur/workspace/selectors';

import { SET_CURRENT_USER } from './constants';
import { getImpersonatedUserUuid } from './WorkspaceStorage';

function* initImpersonation(action) {
  if (!action.payload.user) {
    return;
  }
  if (!action.payload.impersonated) {
    const impersonatorUser = yield select(getImpersonatorUser);
    const storedImpersonatedUserUuid = getImpersonatedUserUuid();
    if (!impersonatorUser && storedImpersonatedUserUuid) {
      try {
        setImpersonationData(storedImpersonatedUserUuid);
        const user = yield call(getCurrentUser);
        yield put(setCurrentUser(user, true));
      } catch {
        clearImpersonationData();
      }
    }
  }
}

export default function* workspaceSaga() {
  yield takeEvery(SET_CURRENT_USER, initImpersonation);
}
