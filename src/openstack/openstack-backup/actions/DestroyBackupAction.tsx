import { openstackBackupsDestroy } from 'waldur-js-client';

import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK', 'ERRED')];

export const DestroyBackupAction: ActionItemType = ({ resource, refetch }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={(id) => openstackBackupsDestroy({ path: { uuid: id } })}
    refetch={refetch}
  />
);
