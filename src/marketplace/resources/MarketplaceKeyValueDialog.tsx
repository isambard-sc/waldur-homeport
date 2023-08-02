import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { KeyValueTable } from './KeyValueTable';

export const MarketplaceKeyValueDialog: FunctionComponent<any> = (props) => {
  return (
    <ModalDialog
      title={props.resolve.title}
      footer={<CloseDialogButton label={translate('Ok')} />}
    >
      <KeyValueTable items={props.resolve.items} />
    </ModalDialog>
  );
};
