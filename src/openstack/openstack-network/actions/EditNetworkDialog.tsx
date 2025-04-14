import { FC } from 'react';
import { openstackNetworksUpdate } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export const EditNetworkDialog: FC<ActionDialogProps> = ({
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
      updateResource={(uuid, body) =>
        openstackNetworksUpdate({ path: { uuid }, body })
      }
      verboseName={translate('network')}
      refetch={refetch}
    />
  );
};
