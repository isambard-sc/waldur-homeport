import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const SetAllowedAddressPairsDialog = lazyComponent(() =>
  import('./SetAllowedAddressPairsDialog').then((module) => ({
    default: module.SetAllowedAddressPairsDialog,
  })),
);

export const SetAllowedAddressPairsButton: FunctionComponent<{
  instance;
  port;
}> = ({ instance, port }) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(SetAllowedAddressPairsDialog, {
        resolve: {
          instance,
          port,
        },
        size: 'lg',
      }),
    );
  return (
    <ActionButton
      title={translate('Set allowed address pairs')}
      iconNode={<PencilSimple />}
      action={openDialog}
    />
  );
};
