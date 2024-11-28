import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { useAsync } from 'react-use';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { loadVolumeTypes, retypeVolume } from '@waldur/openstack/api';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { useNotify } from '@waldur/store/hooks';

export const RetypeDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const asyncState = useAsync(async () => {
    const types = await loadVolumeTypes({
      tenant_uuid: resource.tenant_uuid,
    });
    return {
      types: types
        .map((volumeType) => ({
          value: volumeType.url,
          label: volumeType.description
            ? `${volumeType.name} (${volumeType.description})`
            : volumeType.name,
        }))
        .filter((choice) => choice.value !== resource.type),
    };
  });

  const submitRequest = async (formData) => {
    try {
      await retypeVolume(resource.uuid, { type: formData.type.value });
      showSuccess(translate('Volume has been retyped.'));
      closeDialog();
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      showErrorResponse(e, translate('Unable to retype volume.'));
    }
  };

  return (
    <Form
      onSubmit={submitRequest}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate('Retype OpenStack Volume')}
            loading={asyncState.loading}
            error={asyncState.error}
            submitting={submitting}
            invalid={invalid}
          >
            <p>
              <strong>{translate('Current type')}:</strong> {resource.type_name}
            </p>
            {asyncState.value?.types.length > 0 ? (
              <FormGroup label={translate('Volume type')} required>
                <Field
                  name="type"
                  validate={required}
                  render={({ input }) => (
                    <Select {...input} options={asyncState.value.types} />
                  )}
                />
              </FormGroup>
            ) : (
              <p>{translate('There are no other volume types available.')}</p>
            )}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};
