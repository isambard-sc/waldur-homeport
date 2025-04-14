import { FC } from 'react';
import {
  openstackSecurityGroupsUpdate,
  OpenStackSecurityGroupUpdateRequest,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  return (
    <UpdateResourceDialog
      fields={[createNameField(), createDescriptionField()]}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={(uuid, formData: OpenStackSecurityGroupUpdateRequest) =>
        openstackSecurityGroupsUpdate({
          path: { uuid },
          body: formData,
        })
      }
      refetch={refetch}
      verboseName={translate('security group')}
    />
  );
};
