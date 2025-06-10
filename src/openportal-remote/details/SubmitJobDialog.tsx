import { FC } from 'react';
import { useDispatch } from 'react-redux';
// import { openportalJobsCreate } from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@waldur/core/api';
import { FileUploadField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

// dummy function
export const openPortalRemoteJobsCreate = (options: any) => {
  return new Promise((resolve) => {
    resolve({
      data: {
        uuid: options.path.uuid,
        name: options.body.name,
        description: options.body.description,
      },
    });
  });
};


export const SubmitJobDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Submit job')}
      formFields={[
        {
          name: 'file',
          label: translate('Batch script file'),
          component: FileUploadField,
        },
      ]}
      submitForm={async (formData) => {
        try {
          await openportalRemoteJobsCreate({
            body: {
              name: 'job',
              file: fileSerializer(formData.file),
              project: resource.project,
              service_settings: resource.service_settings,
            },
            ...formDataOptions,
          });
          dispatch(showSuccess(translate('Job has been submitted.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to submit job.')));
        }
      }}
    />
  );
};
