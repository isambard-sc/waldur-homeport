import { FC } from 'react';
//import {
//  OpenPortalAllocationSetLimits,
//  openportalAllocationsSetLimits,
//} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { UpdateResourceDialog } from '@waldur/resource/actions/UpdateResourceDialog';

export type OpenPortalAllocationSetLimits = {
  node_limit?: number;
};

// dummy function
export const openportalAllocationsSetLimits = (options: any) => {
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
  limits: OpenPortalAllocationSetLimits,
): OpenPortalAllocationSetLimits => ({
  node_limit: Math.ceil(limits.node_limit),
});

const serializeLimits = (
  limits: OpenPortalAllocationSetLimits,
): OpenPortalAllocationSetLimits => ({
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
      openportalAllocationsSetLimits({
        path: { uuid: id },
        body: serializeLimits(limits),
      })
    }
    verboseName={translate('OpenPortal allocation')}
    refetch={refetch}
  />
);
