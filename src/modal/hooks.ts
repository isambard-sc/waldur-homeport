import { useDispatch } from 'react-redux';

import { openModalDialog, closeModalDialog } from './actions';

export const useModal = () => {
  const dispatch = useDispatch();
  return {
    openDialog: (component, props) =>
      dispatch(openModalDialog(component, props)),
    closeDialog: () => dispatch(closeModalDialog()),
  };
};
