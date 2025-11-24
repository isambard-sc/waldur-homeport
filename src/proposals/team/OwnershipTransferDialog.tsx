import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OwnershipTransferDialogProps {
  currentManager: {
    full_name?: string;
    email?: string;
    username?: string;
  };
  newManager: {
    full_name?: string;
    email?: string;
    username?: string;
  };
  onConfirm: () => void;
  onCancel?: () => void;
}

export const OwnershipTransferDialog: FC<OwnershipTransferDialogProps> = ({
  currentManager,
  newManager,
  onConfirm,
  onCancel,
}) => {
  const dispatch = useDispatch();

  const handleConfirm = () => {
    onConfirm();
    dispatch(closeModalDialog('HIDE_CONFIRM'));
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    dispatch(closeModalDialog('HIDE_CONFIRM'));
  };

  const getCurrentManagerName = () =>
    currentManager?.full_name || currentManager?.username || currentManager?.email;

  const getNewManagerName = () =>
    newManager?.full_name || newManager?.username || newManager?.email;

  return (
    <ModalDialog
      title={translate('Transfer ownership')}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary min-w-125px"
            onClick={handleCancel}
          >
            {translate('Cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary min-w-125px"
            onClick={handleConfirm}
          >
            {translate('Confirm transfer')}
          </button>
        </>
      }
    >
      <div className="mb-7">
        <div className="alert alert-warning d-flex align-items-center mb-5">
          <i className="fa fa-exclamation-triangle fs-2x me-4" />
          <div className="d-flex flex-column">
            <h4 className="mb-1 text-dark">
              {translate('Ownership transfer warning')}
            </h4>
            <span>
              {translate(
                'Transferring the MANAGER role will make you a MEMBER of this proposal. The new user will become the owner and manager.',
              )}
            </span>
          </div>
        </div>

        <div className="mb-5">
          <h5 className="mb-3">{translate('Current manager')}</h5>
          <div className="d-flex flex-column ps-5">
            <span className="fw-bold">{getCurrentManagerName()}</span>
            {currentManager?.email && (
              <span className="text-muted">{currentManager.email}</span>
            )}
          </div>
        </div>

        <div className="mb-5">
          <h5 className="mb-3">{translate('New manager')}</h5>
          <div className="d-flex flex-column ps-5">
            <span className="fw-bold">{getNewManagerName()}</span>
            {newManager?.email && (
              <span className="text-muted">{newManager.email}</span>
            )}
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};
