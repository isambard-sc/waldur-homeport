import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { loadVolumeTypes, retypeVolume } from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const RetypeDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

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

  const fields = asyncState.value
    ? [
        {
          component: () => (
            <p>
              <strong>{translate('Current type')}</strong>: {resource.type_name}
            </p>
          ),
        },
        asyncState.value.types.length > 0
          ? {
              name: 'type',
              label: translate('Volume type'),
              type: 'select',
              required: true,
              options: asyncState.value.types,
            }
          : {
              component: () => (
                <p>{translate('There are no other volume types available.')}</p>
              ),
            },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Retype OpenStack Volume')}
      loading={asyncState.loading}
      error={asyncState.error}
      formFields={fields}
      submitForm={async (formData) => {
        try {
          await retypeVolume(resource.uuid, formData);
          dispatch(showSuccess(translate('Volume has been retyped.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to retype volume.')));
        }
      }}
    />
  );
};
