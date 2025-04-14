import { azureSqlServersDestroy } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const validators = [validateState('OK', 'ERRED')];

export const DestroyServerAction: ActionItemType = ({ resource, refetch }) => (
  <DestroyActionItem
    validators={validators}
    resource={resource}
    apiMethod={(id) => azureSqlServersDestroy({ path: { uuid: id } })}
    dialogSubtitle={translate(
      'Deleting PostgreSQL server will cause deletion of all databases created within server.',
    )}
    refetch={refetch}
  />
);
