import { FC } from 'react';

import { CopyToClipboard } from '@waldur/core/CopyToClipboard';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

type OwnProps = { resolve: { offering: Offering; config: string } };

export const GLAuthConfigDialog: FC<OwnProps> = (props) => {
  return (
    <MetronicModalDialog
      title={translate('GLAuth configuration for {offering}', {
        offering: props.resolve.offering.name,
      })}
      actions={
        <CopyToClipboard
          value={props.resolve.config}
          label={translate('Copy')}
          className="btn-outline btn-outline-default w-150px"
        />
      }
      footer={
        <CloseDialogButton
          variant="primary"
          label={translate('Close')}
          className="w-150px"
        />
      }
    >
      <MonacoField
        input={{ onChange: null, value: props.resolve.config }}
        readOnly
      />
    </MetronicModalDialog>
  );
};
