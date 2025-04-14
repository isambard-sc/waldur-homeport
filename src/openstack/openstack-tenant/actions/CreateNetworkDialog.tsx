import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackTenantsCreateNetwork } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const CreateNetworkDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create network for OpenStack tenant')}
      formFields={[createLatinNameField(), createDescriptionField()]}
      submitForm={async (formData) => {
        try {
          await openstackTenantsCreateNetwork({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(
            showSuccess(translate('OpenStack networks has been created.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to create OpenStack networks.'),
            ),
          );
        }
      }}
    />
  );
};
