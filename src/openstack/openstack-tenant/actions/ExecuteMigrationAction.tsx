import { AirplaneIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { openstackMigrationsRun } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import { validateState } from '@waldur/resource/actions/base';

import { TenantActionProps } from './types';

export const ExecuteMigrationAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <AsyncActionItem
    title={translate('Execute')}
    iconNode={<AirplaneIcon weight="bold" />}
    resource={resource}
    apiMethod={(uuid) => openstackMigrationsRun({ path: { uuid } })}
    refetch={refetch}
    validators={[validateState('CREATION_SCHEDULED')]}
  />
);
