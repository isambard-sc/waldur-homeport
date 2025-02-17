import { PlusCircle } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { OpenStackInstance } from '../types';

const CreateBackupScheduleDialog = lazyComponent(() =>
  import('./CreateBackupScheduleDialog').then((module) => ({
    default: module.CreateBackupScheduleDialog,
  })),
);

interface CreateBackupScheduleActionProps {
  resource: OpenStackInstance;
}

const validators = [validateState('OK')];

export const CreateBackupScheduleAction: FC<
  CreateBackupScheduleActionProps
> = ({ resource }) => (
  <DialogActionButton
    title={translate('Create')}
    iconNode={<PlusCircle />}
    modalComponent={CreateBackupScheduleDialog}
    formId={RESOURCE_ACTION_FORM}
    resource={resource}
    validators={validators}
  />
);
