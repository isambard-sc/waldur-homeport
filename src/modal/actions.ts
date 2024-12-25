import { ReactNode } from 'react';
import { ModalProps } from 'react-bootstrap';

import { createDeferred } from '@waldur/core/utils';

import { ConfirmationDialog } from './ConfirmationDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

export type DialogSizeType = 'sm' | 'lg' | 'xl';

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
  forDeletion?: boolean,
) => {
  const deferred = createDeferred();
  const params = {
    resolve: {
      deferred,
      title,
      body,
    },
  };
  dispatch(
    openModalDialog(
      forDeletion ? DeleteConfirmationDialog : ConfirmationDialog,
      forDeletion ? { ...params, size: 'sm' } : params,
    ),
  );
  return deferred.promise;
};
