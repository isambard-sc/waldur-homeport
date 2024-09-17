import { ClockClockwise } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const BackupRestoreDialog = lazyComponent(
  () => import('./BackupRestoreDialog'),
  'BackupRestoreDialog',
);

const validators = [validateState('OK')];

export const RestoreAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Restore')}
    modalComponent={BackupRestoreDialog}
    resource={resource}
    extraResolve={{ refetch }}
    iconNode={<ClockClockwise />}
  />
);
