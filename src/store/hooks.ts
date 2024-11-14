import { useDispatch } from 'react-redux';

import { showError, showErrorResponse, showSuccess } from './notify';

export const useNotify = () => {
  const dispatch = useDispatch();
  return {
    showSuccess: (message) => dispatch(showSuccess(message)),
    showError: (message) => dispatch(showError(message)),
    showErrorResponse: (error, message) =>
      dispatch(showErrorResponse(error, message)),
  };
};
