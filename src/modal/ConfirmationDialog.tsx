import { WarningCircle } from '@phosphor-icons/react';
import React, { ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';

import { MetronicModalDialog } from './MetronicModalDialog';
import { ConfirmationDialogType } from './types';

interface ConfirmationDialogProps {
  resolve: {
    deferred: {
      resolve: () => void;
      reject: () => void;
    };
    title: ReactNode;
    body: ReactNode;
    nb?: ReactNode;
    type?: ConfirmationDialogType;
    positiveButton?: string;
    negativeButton?: string;
  };
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  resolve: {
    title,
    body,
    deferred,
    type = 'warning',
    positiveButton = translate('Yes'),
    negativeButton = translate('No'),
  },
}) => {
  const dispatch = useDispatch();
  const closeDialog = () => dispatch(closeModalDialog());

  const handleSubmit = () => {
    deferred.resolve();
    closeDialog();
  };

  const handleCancel = () => {
    deferred.reject();
    closeDialog();
  };

  return (
    <MetronicModalDialog
      title={title}
      iconNode={<WarningCircle weight="bold" />}
      iconColor={type}
      bodyClassName="text-grey-500 pt-2"
      footer={
        <>
          <Button
            variant="outline btn-outline-default"
            className="flex-equal"
            onClick={handleCancel}
          >
            {negativeButton}
          </Button>
          <Button className="flex-equal" onClick={handleSubmit}>
            {positiveButton}
          </Button>
        </>
      }
    >
      {body}
    </MetronicModalDialog>
  );
};
