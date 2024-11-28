import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { updateUser } from './api';

export const useUpdateUser = (user: UserDetails) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useSelector(getUser) as any;

  const { showErrorResponse, showSuccess } = useNotify();

  const callback = async (data) => {
    setIsLoading(true);
    try {
      const { data: newUser } = await updateUser(user.uuid, {
        ...data,
        agree_with_policy: true,
      });
      if (newUser.uuid === currentUser.uuid) {
        dispatch(setCurrentUser(newUser));
      }
      showSuccess(translate('User has been updated'));
    } catch (error) {
      showErrorResponse(error, translate('User could not be updated'));
    } finally {
      setIsLoading(false);
    }
  };

  return { callback, isLoading };
};
