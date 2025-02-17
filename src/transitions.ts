import store from '@waldur/store/store';

import { MatomoInstance } from './afterBootstrap';
import { setRedirect } from './auth/AuthRedirectStorage';
import * as AuthService from './auth/AuthService';
import { cleanObject } from './core/utils';
import { setPrevParams, setPrevState } from './error/utils';
import { isFeatureVisible } from './features/connect';
import { tryAcceptInvitation } from './invitations/tryAcceptInvitation';
import { closeModalDialog } from './modal/actions';
import { router } from './router';
import { UsersService } from './user/UsersService';

export function attachTransitions() {
  router.transitionService.onSuccess({}, function () {
    store.dispatch(closeModalDialog());
  });

  router.transitionService.onSuccess({}, function () {
    document['scrollTop'] = 0;
    const wrapper = document.querySelector('#wrapper');
    if (wrapper) {
      wrapper.scrollTop = 0;
    }
  });

  router.transitionService.onBefore(
    {
      to: (state) =>
        state.data && state.data.auth && AuthService.isAuthenticated(),
    },
    async (transition) => {
      try {
        const result = await UsersService.isCurrentUserValid();
        if (result) {
          return;
        }
        if (transition.to().name == 'profile-manage') {
          return;
        }
        return transition.router.stateService.target('profile-manage');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    },
  );
  // If state parent is `auth` and user does not have authentication token,
  // he should be redirected to login page.

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data && state.data.auth && !AuthService.isAuthenticated(),
    },
    (transition) =>
      transition.router.stateService.target(
        'login',
        {
          toState: transition.to().name,
          toParams: cleanObject(transition.params()),
        },
        { location: 'replace' },
      ),
  );
  // If state data has `anonymous` flag and user has authentication token,
  // he is redirected to dashboard.

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data && state.data.anonymous && AuthService.isAuthenticated(),
    },
    (transition) => transition.router.stateService.target('profile.details'),
  );
  // If state data has `feature` field and this feature is disabled,
  // user is redirected to 404 error page.

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data &&
        state.data.feature &&
        !isFeatureVisible(state.data.feature),
    },
    (transition) =>
      transition.router.stateService.target(
        transition.options().custom?.fallbackState || 'errorPage.notFound',
      ),
  );

  router.transitionService.onStart(
    {
      to: (state) =>
        state.data &&
        state.data.permissions &&
        !state.data.permissions.every((permission) => {
          try {
            return permission(store.getState());
          } catch {
            // Swallow errors if permission check fails.
            return true;
          }
        }),
    },
    (transition) =>
      transition.router.stateService.target(
        transition.options().custom?.fallbackState || 'errorPage.notFound',
      ),
  );

  router.transitionService.onError({}, (transition) => {
    const error = transition.error();
    // Erred state is terminal, user should not be redirected from erred state to login
    // so that he would be able to read error message details
    if (error && error.detail && error.detail.status === 401) {
      setRedirect({
        toState: transition.to().name,
        toParams: transition.to().params,
      });
      AuthService.clearAuthCache();
      return transition.router.stateService.target('login');
    }
    if (error && error['redirectTo'] && error['status'] !== -1) {
      return transition.router.stateService.target(error['redirectTo']);
    } else {
      return transition.router.stateService.target('errorPage.notFound');
    }
  });

  router.transitionService.onStart({}, (transition) => {
    const fromName = transition.from().name;
    if (fromName) {
      setPrevState(fromName);
      setPrevParams(transition.params('from'));
    }
  });

  router.transitionService.onSuccess({}, (transition) => {
    if (AuthService.isAuthenticated() && !transition.to().data?.skipAuth) {
      if (router.urlService.path().split('/')[1] !== 'user-group-invitations') {
        tryAcceptInvitation();
      }
    }
  });

  router.transitionService.onSuccess({}, () => {
    if (MatomoInstance) {
      MatomoInstance.trackPageView();
    }
  });

  router.transitionService.onSuccess({}, (transition) => {
    if (
      transition.to().data?.auth &&
      !Object.prototype.hasOwnProperty.call(transition.params(), 'toState')
    ) {
      setRedirect({
        toState: transition.to().name,
        toParams: transition.params(),
      });
    }
  });
}
