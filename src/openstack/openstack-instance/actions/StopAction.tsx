import { translate } from '@waldur/i18n';
import { stopInstance } from '@waldur/openstack/api';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { AsyncActionItem } from '@waldur/resource/actions/AsyncActionItem';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ActionContext, ActionItemType } from '@waldur/resource/actions/types';

function validate(ctx: ActionContext<OpenStackInstance>): string {
  if (ctx.resource.state === 'OK' && ctx.resource.runtime_state === 'SHUTOFF') {
    return translate('Instance is already stopped.');
  }
}

const validators = [
  validate,
  validateState('OK'),
  validateRuntimeState('ACTIVE'),
];

export const StopAction: ActionItemType = ({ resource, ...rest }) => (
  <AsyncActionItem
    title={translate('Stop')}
    iconClass="fa-stop"
    resource={resource}
    validators={validators}
    apiMethod={stopInstance}
    {...rest}
  />
);
