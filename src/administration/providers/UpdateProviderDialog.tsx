import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { updateIdentityProvider } from '../api';

import { ProviderForm } from './ProviderForm';

interface UpdateProviderDialogProps {
  resolve: {
    provider: { provider: string };
    type: string;
    refetch?: () => Promise<void>;
  };
}

export const UpdateProviderDialog = ({
  resolve,
}: UpdateProviderDialogProps) => {
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async (formData) => {
      try {
        await updateIdentityProvider(resolve.provider.provider, formData);
        dispatch(
          showSuccess(
            translate('Identity provider has been updated successfully.'),
          ),
        );
        if (resolve.refetch) await resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to update identity provider.'),
          ),
        );
      }
    },
    [dispatch, resolve],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={resolve.provider}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <Modal.Header>
            <Modal.Title>
              {translate('Update identity provider: {provider}', {
                provider: resolve.type,
              })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProviderForm />
          </Modal.Body>
          <Modal.Footer>
            <SubmitButton
              disabled={invalid}
              submitting={submitting}
              label={translate('Save')}
            />
          </Modal.Footer>
        </form>
      )}
    />
  );
};
