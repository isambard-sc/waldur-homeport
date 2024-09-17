import { Play } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { ActionItemType } from '@waldur/resource/actions/types';

import { startVirtualMachine } from '../api';

const validators = [
  validateState('OK'),
  validateRuntimeState('POWERED_OFF', 'SUSPENDED'),
];

export const StartAction: ActionItemType = ({ resource, refetch }) => (
  <AsyncActionItem
    title={translate('Start')}
    resource={resource}
    validators={validators}
    apiMethod={startVirtualMachine}
    refetch={refetch}
    iconNode={<Play />}
  />
);
