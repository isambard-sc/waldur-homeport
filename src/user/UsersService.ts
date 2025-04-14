import {
  Options,
  User,
  usersMeRetrieve,
  UsersMeRetrieveData,
} from 'waldur-js-client';

import { getRoles } from '@waldur/administration/roles/utils';
import { initApiClient } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import store from '@waldur/store/store';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';
import {
  setImpersonatedUserUuid,
  clearImpersonatedUserUuid,
  getImpersonatedUserUuid,
} from '@waldur/workspace/WorkspaceStorage';

export const getCurrentUser = async (
  options?: Options<UsersMeRetrieveData>,
) => {
  const user = await usersMeRetrieve(options).then((response) => response.data);
  if (ENV.roles.length === 0) {
    ENV.roles = await getRoles();
  }
  return user;
};

export const setImpersonationData = (userUuid) => {
  setImpersonatedUserUuid(userUuid);
  initApiClient();
};

export const clearImpersonationData = () => {
  clearImpersonatedUserUuid();
  initApiClient();
};

class UsersServiceClass {
  getCurrentUser(refetch = false) {
    const cached = this.getCachedUser();
    if (!refetch && cached) {
      return Promise.resolve(cached);
    }
    return getCurrentUser().then((user) => {
      const isImpersonated = Boolean(getImpersonatedUserUuid());
      store.dispatch(setCurrentUser(user, isImpersonated));
      return user;
    });
  }

  getCachedUser() {
    return getUser(store.getState());
  }

  isCurrentUserValid() {
    return this.getCurrentUser().then((user) => {
      return (
        user.is_staff ||
        (!this.mandatoryFieldsMissing(user) && (user as User).agreement_date)
      );
    });
  }

  mandatoryFieldsMissing(user) {
    return ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS.reduce(
      (result, item) => result || !user[item],
      false,
    );
  }
}

export const UsersService = new UsersServiceClass();
