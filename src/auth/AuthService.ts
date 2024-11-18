import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import {
  clearImpersonationData,
  UsersService,
} from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';

import { getRedirect, resetRedirect, setRedirect } from './AuthRedirectStorage';
import { getToken, removeToken, setToken } from './TokenStorage';

export function setAuthHeader(token) {
  setToken(token);
  Axios.defaults.headers.Authorization = 'Token ' + token;
}

export function loginSuccess(response) {
  setAuthHeader(response.data.token);
  store.dispatch(setCurrentUser(response.data));
}

export function isAuthenticated() {
  return !!getToken();
}

export async function signin(username, password) {
  const response = await Axios.post<{ token: string }>(
    ENV.apiEndpoint + 'api-auth/password/',
    {
      username,
      password,
    },
  );
  setAuthHeader(response.data.token);
  const user = await UsersService.getCurrentUser();
  loginSuccess({ data: { ...user, method: 'local' } });
}

export function storeRedirect() {
  if (
    router.globals.params?.toState &&
    router.globals.params?.toState !== 'profile.details'
  ) {
    setRedirect({
      toState: router.globals.params.toState,
      toParams: router.globals.params.toParams,
    });
  }
}

export function redirectOnSuccess() {
  const redirect = getRedirect();
  if (redirect) {
    resetRedirect();
    return router.stateService.go(redirect.toState, redirect.toParams, {
      reload: true,
      custom: {
        fallbackState: 'profile.details',
      },
    });
  } else {
    return router.stateService.go('profile.details', { reload: true });
  }
}

export function clearAuthCache() {
  store.dispatch(setCurrentUser(undefined));
  clearImpersonationData();
  delete Axios.defaults.headers.Authorization;
  removeToken();
}

export function localLogout() {
  clearAuthCache();
  router.stateService.go('login');
}
