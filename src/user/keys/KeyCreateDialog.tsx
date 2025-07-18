import React from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { keysCreate, SshKeyRequest } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form/StringField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { createEntity } from '@waldur/table/actions';

import * as constants from './constants';

const extractNameFromKey = (publicKey: string) => {
  if (publicKey) {
    const key = publicKey.split(' ');
    if (key.length === 3 && key[2]) {
      return key[2].trim();
    }
  }
  return '';
};

interface KeyCreateDialogProps {
  refetch?: () => void;
}

export const KeyCreateDialog: React.FC<KeyCreateDialogProps> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const processRequest = React.useCallback(
    async (values: SshKeyRequest) => {
      let data = { ...values };
      try {
        if (!values.name) {
          const name = extractNameFromKey(values.public_key);
          data = { ...values, name };
        }
        const response = await keysCreate({ body: data });
        const createdKey = response.data;
        dispatch(
          createEntity(constants.keysListTable, createdKey.uuid, createdKey),
        );
        if (refetch) {
          await refetch();
        }
        showSuccess(translate('The key has been created.'));
        closeDialog();
      } catch (e) {
        showErrorResponse(e, translate('Unable to create key.'));
      }
    },
    [dispatch, showSuccess, showErrorResponse, closeDialog, refetch],
  );

  return (
    <Form
      onSubmit={processRequest}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Import public key')}
            closeButton
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Import key')}
                className="btn btn-primary"
              />
            }
          >
            <div className="size-lg">
              <FormGroup label={translate('Key name')}>
                <Field
                  component={StringField as any}
                  name="name"
                  placeholder={translate('e.g. my-ssh-key')}
                />
              </FormGroup>
              <FormGroup label={translate('Public key')} required>
                <Field
                  component={TextField as any}
                  name="public_key"
                  validate={required}
                  style={{ height: 100 }}
                  placeholder={translate('Paste your SSH public key here...')}
                />
              </FormGroup>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
