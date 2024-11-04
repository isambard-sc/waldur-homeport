import { useDispatch, useSelector } from 'react-redux';

import { ThemeName } from '@waldur/navigation/theme/types';

import { showError, showErrorResponse, showSuccess } from './notify';
import { RootState } from './reducers';

export const useNotify = () => {
  const dispatch = useDispatch();
  return {
    showSuccess: (message) => dispatch(showSuccess(message)),
    showError: (message) => dispatch(showError(message)),
    showErrorResponse: (error, message) =>
      dispatch(showErrorResponse(error, message)),
  };
};

export const useTheme = (): ThemeName => {
  return useSelector((state: RootState) => state.theme?.theme);
};
