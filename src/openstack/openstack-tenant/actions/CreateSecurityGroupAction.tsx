import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { TenantActionProps } from './types';

const CreateSecurityGroupDialog = lazyComponent(() =>
  import('./CreateSecurityGroupDialog').then((module) => ({
    default: module.CreateSecurityGroupDialog,
  })),
);

const validators = [validateState('OK')];

export const CreateSecurityGroupAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircle />}
    modalComponent={CreateSecurityGroupDialog}
    resource={resource}
    dialogSize="xl"
    validators={validators}
    extraResolve={{ refetch }}
  />
);
