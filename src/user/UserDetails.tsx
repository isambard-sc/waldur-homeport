import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useEffectOnce } from 'react-use';

import { usePageHero } from '@waldur/navigation/context';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import { setCurrentUser } from '@waldur/workspace/actions';
import { useUser } from '@waldur/workspace/hooks';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails as IUserDetails } from '@waldur/workspace/types';

import { UserProfileHero } from './dashboard/UserProfileHero';
import { UsersService } from './UsersService';

async function loadUser() {
  const currentUser = getUser(store.getState());
  if (
    router.globals.params.uuid === undefined ||
    router.globals.params.uuid === currentUser.uuid
  ) {
    store.dispatch(setCurrentUser(currentUser));
  } else if (currentUser.is_staff || currentUser.is_support) {
    try {
      const user = await UsersService.get(router.globals.params.uuid);
      store.dispatch(setCurrentUser(user));
    } catch (error) {
      if (error.response?.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    }
  } else {
    router.stateService.go('errorPage.notFound');
  }
}

const WithHero = () => {
  const user = useUser() as IUserDetails;
  const { state } = useCurrentStateAndParams();

  usePageHero(<UserProfileHero user={user} isLoading={!user} />, [user, state]);

  return <UIView />;
};

export const UserDetails: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();

  useEffectOnce(() => {
    loadUser();
  });

  if (state.data?.skipHero) {
    return <UIView />;
  }
  return <WithHero />;
};
