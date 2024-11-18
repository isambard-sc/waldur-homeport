import { Airplane } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { runMigration } from '@waldur/openstack/api';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import { validateState } from '@waldur/resource/actions/base';

import { TenantActionProps } from './types';

export const ExecuteMigrationAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <AsyncActionItem
    title={translate('Execute')}
    iconNode={<Airplane />}
    resource={resource}
    apiMethod={runMigration}
    refetch={refetch}
    validators={[validateState('Creation Scheduled')]}
  />
);
