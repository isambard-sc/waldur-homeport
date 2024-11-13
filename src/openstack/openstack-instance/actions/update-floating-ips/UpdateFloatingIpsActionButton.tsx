import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';
import { ActionItemType } from '@waldur/resource/actions/types';

const UpdateFloatingIpsDialog = lazyComponent(() =>
  import('./UpdateFloatingIpsDialog').then((module) => ({
    default: module.UpdateFloatingIpsDialog,
  })),
);

const validators = [validateState('OK')];

export const UpdateFloatingIpsActionButton: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    resource={resource}
    title={translate('Update floating IPs')}
    validators={validators}
    modalComponent={UpdateFloatingIpsDialog}
    extraResolve={{ refetch }}
    dialogSize="lg"
  />
);
