import { FC } from 'react';
import { slurmAllocationsUpdate } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

const getFields = () => [createNameField(), createDescriptionField()];

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
        slurmAllocationsUpdate({ path: { uuid: id }, body: formData })
      }
      verboseName={translate('SLURM allocation')}
      refetch={refetch}
    />
  );
};
