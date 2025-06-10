import { FC } from 'react';
//import {
//  OpenPortalAllocationSetLimits,
//  openportalAllocationsSetLimits,
//} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export type OpenPortalRemoteAllocationSetLimits = {
  node_limit?: number;
};

// dummy function
export const openportalRemoteAllocationsSetLimits = (options: any) => {
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


const getFields = () => [
  {
    name: 'node_limit',
    type: 'integer',
    required: true,
    label: translate('Node limit (seconds)'),
  },
];

const parseLimits = (
  limits: OpenPortalRemoteAllocationSetLimits,
): OpenPortalRemoteAllocationSetLimits => ({
  node_limit: Math.ceil(limits.node_limit),
});

const serializeLimits = (
  limits: OpenPortalRemoteAllocationSetLimits,
): OpenPortalRemoteAllocationSetLimits => ({
  node_limit: limits.node_limit,
});

export const SetLimitsDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => (
  <UpdateResourceDialog
    fields={getFields()}
    resource={resource}
    initialValues={parseLimits(resource)}
    updateResource={(id, limits) =>
      openportalRemoteAllocationsSetLimits({
        path: { uuid: id },
        body: serializeLimits(limits),
      })
    }
    verboseName={translate('OpenPortal Remote Allocation')}
    refetch={refetch}
  />
);
