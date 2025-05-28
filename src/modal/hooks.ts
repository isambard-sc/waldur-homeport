import { ComponentType } from 'react';
import { useDispatch } from 'react-redux';

import { openModalDialog, closeModalDialog, AppModalProps } from './actions';

export const useModal = () => {
  const dispatch = useDispatch();
  return {
    openDialog: <T>(component: ComponentType<T>, props: T & AppModalProps) =>
      dispatch(openModalDialog(component, props)),
    closeDialog: () => dispatch(closeModalDialog()),
  };
};
