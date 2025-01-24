import { ReactNode } from 'react';
import { ModalProps } from 'react-bootstrap';

import { createDeferred } from '@waldur/core/utils';

import { ConfirmationDialog } from './ConfirmationDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { ConfirmationDialogType, DialogSizeType } from './types';

export interface AppModalProps extends ModalProps {
  size?: DialogSizeType;
  formId?: string;
}

export const openModalDialog = <P = any>(
  modalComponent: React.ComponentType<P>,
  modalProps?: P & AppModalProps,
) => ({
  type: 'SHOW_MODAL',
  modalComponent,
  modalProps,
});

export const closeModalDialog = () => ({
  type: 'HIDE_MODAL',
});

export const waitForConfirmation = (
  dispatch,
  title: ReactNode,
  body: ReactNode,
  options: {
    forDeletion?: boolean;
    type?: ConfirmationDialogType;
    positiveButton?: string;
    negativeButton?: string;
    size?: DialogSizeType;
  } = {},
) => {
  const deferred = createDeferred();
  const params = {
    resolve: {
      deferred,
      title,
      body,
      ...options,
    },
    size: options.size,
  };
  dispatch(
    openModalDialog(
      options.forDeletion ? DeleteConfirmationDialog : ConfirmationDialog,
      options.forDeletion ? { size: 'sm', ...params } : params,
    ),
  );
  return deferred.promise;
};
