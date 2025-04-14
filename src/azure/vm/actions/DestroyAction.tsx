import { azureVirtualmachinesDestroy } from 'waldur-js-client';

import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK', 'ERRED')];

export const DestroyAction: ActionItemType = ({ resource, refetch }) => (
  <DestroyActionItem
    resource={resource}
    validators={validators}
    apiMethod={(id) => azureVirtualmachinesDestroy({ path: { uuid: id } })}
    refetch={refetch}
  />
);
