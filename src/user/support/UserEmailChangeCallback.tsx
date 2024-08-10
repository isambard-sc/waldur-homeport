import { triggerTransition } from '@uirouter/redux';
import { useEffect, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { AuthService } from '@waldur/auth/AuthService';
import { post } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { wait } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { setCurrentUser } from '@waldur/workspace/actions';

import { getCurrentUser } from '../UsersService';

export const UserEmailChangeCallback: FunctionComponent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    async function load() {
      try {
        await post('/users/confirm_email/', {
          code: router.globals.params.token,
        });
        dispatch(showSuccess(translate('Email has been updated.')));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to confirm email.')),
        );
      }

      if (!AuthService.isAuthenticated()) {
        dispatch(triggerTransition('login', {}));
        return;
      }

      let currentUser;
      try {
        currentUser = await getCurrentUser();
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to fetch current user.')),
        );
      }

      if (currentUser) {
        dispatch(setCurrentUser(currentUser));
        await wait(1000);
      }
      dispatch(triggerTransition('profile-manage', {}));
    }
    load();
  }, [dispatch]);

  return (
    <div className="middle-box text-center">
      <LoadingSpinner />
      <h3 className="app-title centered">
        {translate('Verifying email change')}
      </h3>
    </div>
  );
};
