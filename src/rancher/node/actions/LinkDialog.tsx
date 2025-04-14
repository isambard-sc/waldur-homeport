import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import {
  openstackInstancesList,
  rancherNodesLinkOpenstack,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const LinkDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

  const asyncState = useAsync(async () => {
    const instances = await getAllPages((page) =>
      openstackInstancesList({
        query: {
          page,
          project_uuid: resource.project_uuid,
          field: ['url', 'name'],
        },
      }),
    );

    return {
      instances: instances.map((choice) => ({
        value: choice.url,
        label: choice.name,
      })),
    };
  });

  const fields = asyncState.value
    ? [
        {
          name: 'instance',
          type: 'select',
          required: true,
          label: translate('OpenStack instance'),
          options: asyncState.value.instances,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Link OpenStack Instance')}
      formFields={fields}
      submitForm={async (formData) => {
        try {
          await rancherNodesLinkOpenstack({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(showSuccess(translate('Instance has been linked.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to link instance.')));
        }
      }}
    />
  );
};
