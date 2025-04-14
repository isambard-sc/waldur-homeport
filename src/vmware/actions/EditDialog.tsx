import { FC } from 'react';
import { vmwareVirtualMachineUpdate } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => (
  <UpdateResourceDialog
    fields={[createNameField(), createDescriptionField()]}
    resource={resource}
    initialValues={{
      name: resource.name,
      description: resource.description,
    }}
    updateResource={(id, formData) =>
      vmwareVirtualMachineUpdate({ path: { uuid: id }, body: formData })
    }
    verboseName={translate('virtual machine')}
    refetch={refetch}
  />
);
