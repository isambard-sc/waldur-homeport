import { FunctionComponent } from 'react';
import { Variant } from 'react-bootstrap/types';

import { StateIndicator } from '@waldur/core/StateIndicator';

type BackupStateType = 'Unsupported' | 'Unset' | 'Warning' | 'OK';

const LABEL_CLASSES: { [key in BackupStateType]: Variant } = {
  Unsupported: 'default',
  Unset: 'danger',
  Warning: 'warning',
  OK: 'info',
};

interface BackupStateIndicatorProps {
  resource: {
    backup_state: BackupStateType;
    last_backup?: string;
  };
}

export const BackupState: FunctionComponent<BackupStateIndicatorProps> = (
  props,
) => (
  <StateIndicator
    label={props.resource.backup_state}
    variant={LABEL_CLASSES[props.resource.backup_state] || 'info'}
    tooltip={props.resource.last_backup}
    outline
    pill
  />
);
