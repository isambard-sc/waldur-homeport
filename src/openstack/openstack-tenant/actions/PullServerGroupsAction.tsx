import { ArrowsClockwise } from '@phosphor-icons/react';
import { FC } from 'react';
import { openstackTenantsPullServerGroups } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionButton } from '@waldur/resource/actions/AsyncActionButton';
import { validateState } from '@waldur/resource/actions/base';

import { TenantActionProps } from './types';

const validators = [validateState('OK')];

export const PullServerGroupsAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <AsyncActionButton
    title={translate('Synchronise')}
    iconNode={<ArrowsClockwise />}
    resource={resource}
    validators={validators}
    apiMethod={(uuid) => openstackTenantsPullServerGroups({ path: { uuid } })}
    refetch={refetch}
  />
);
