import { ArrowsClockwise } from '@phosphor-icons/react';
import { FC } from 'react';
import { openstackTenantsPullSecurityGroups } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { AsyncActionButton } from '@waldur/resource/actions/AsyncActionButton';
import { validateState } from '@waldur/resource/actions/base';

import { TenantActionProps } from './types';

const validators = [validateState('OK')];

export const PullSecurityGroupsAction: FC<TenantActionProps> = ({
  resource,
}) => (
  <AsyncActionButton
    title={translate('Synchronise')}
    iconNode={<ArrowsClockwise />}
    resource={resource}
    validators={validators}
    apiMethod={(uuid) => openstackTenantsPullSecurityGroups({ path: { uuid } })}
  />
);
