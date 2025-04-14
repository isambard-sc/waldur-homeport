import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackInstancesBackup } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const CreateBackupDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create VM snapshot for OpenStack instance')}
      formFields={[
        createLatinNameField(),
        createDescriptionField(),
        {
          name: 'kept_until',
          type: 'datetime',
          required: false,
          label: translate('Kept until'),
          help_text: translate(
            'Guaranteed time of VM snapshot retention. If null - keep forever.',
          ),
        },
      ]}
      initialValues={{
        name: resource.name + '-snapshot',
      }}
      submitForm={async (formData) => {
        try {
          await openstackInstancesBackup({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(showSuccess(translate('VM snapshot has been created.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to create VM snapshot.')),
          );
        }
      }}
    />
  );
};
