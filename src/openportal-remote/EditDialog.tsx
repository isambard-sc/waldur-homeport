import { FC } from 'react';
//import { openportalAllocationsUpdate } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

const getFields = () => [createNameField(), createDescriptionField()];

// dummy function
export const openportalRemoteAllocationsUpdate = (options: any) => {
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

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  return (
    <UpdateResourceDialog
      fields={getFields()}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={(id, formData) =>
        openportalRemoteAllocationsUpdate({ path: { uuid: id }, body: formData })
      }
      verboseName={translate('OpenPortal Remote allocation')}
      refetch={refetch}
    />
  );
};
