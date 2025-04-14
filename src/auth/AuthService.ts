import { apiAuthPassword } from 'waldur-js-client';

import { initApiClient } from '@waldur/core/api';
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
  initApiClient();
}

export function loginSuccess(response) {
  setAuthHeader(response.data.token);
  store.dispatch(setCurrentUser(response.data));
}

export function isAuthenticated() {
  return !!getToken();
}

export async function signin(username, password) {
  const response = await apiAuthPassword({
    body: {
      username,
      password,
    },
  });
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
    // If redirect is not possible, go to default state
    const href = router.stateService.href(redirect.toState, redirect.toParams);
    if (!href) {
      return router.stateService.go('profile.details', { reload: true });
    }
    // TODO: Use router.stateService.go(redirect.toState, redirect.toParams) instead
    document.location = href;
  } else {
    return router.stateService.go('profile.details', { reload: true });
  }
}

export function clearAuthCache() {
  store.dispatch(setCurrentUser(undefined));
  clearImpersonationData();
  removeToken();
}

export function localLogout() {
  clearAuthCache();
  router.stateService.go('login');
}
