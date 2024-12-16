import { FC } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';

import { translate } from '@waldur/i18n';
import { updateOfferingIntegration } from '@waldur/marketplace/common/api';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

interface ChangeStorageModeDialogProps {
  resolve: {
    offering: any;
    refetch(): void;
    currentMode: string;
    modes: Array<{ value: string; label: string }>;
  };
}

export const ChangeStorageModeDialog: FC<ChangeStorageModeDialogProps> = (
  props,
) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  return (
    <Form
      onSubmit={async (formData) => {
        try {
          await updateOfferingIntegration(props.resolve.offering.uuid, {
            plugin_options: {
              ...props.resolve.offering.plugin_options,
              storage_mode: formData.storage_mode,
            },
          });
          showSuccess(translate('Storage mode has been updated.'));
          closeDialog();
          props.resolve.refetch();
        } catch (error) {
          showErrorResponse(error, translate('Unable to update storage mode.'));
        }
      }}
      initialValues={{ storage_mode: props.resolve.currentMode }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Modal.Header>
            <Modal.Title>{translate('Change storage mode')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Field name="storage_mode">
              {({ input }) => (
                <select {...input} className="form-control">
                  {props.resolve.modes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => closeDialog()}>
              {translate('Cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {translate('Save')}
            </Button>
          </Modal.Footer>
        </form>
      )}
    />
  );
};
