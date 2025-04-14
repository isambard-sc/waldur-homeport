import { rancherNodesDestroy } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK', 'ERRED')];

export const DestroyAction: ActionItemType = ({ resource, refetch }) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE ? (
    <DestroyActionItem
      validators={validators}
      resource={resource}
      apiMethod={(id) => rancherNodesDestroy({ path: { uuid: id } })}
      refetch={refetch}
    />
  ) : null;
