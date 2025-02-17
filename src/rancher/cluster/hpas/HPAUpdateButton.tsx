import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const HPAUpdateDialog = lazyComponent(() =>
  import('./HPAUpdateDialog').then((module) => ({
    default: module.HPAUpdateDialog,
  })),
);

const editHPADialog = (hpa) =>
  openModalDialog(HPAUpdateDialog, { resolve: { hpa } });

export const HPAUpdateButton: FunctionComponent<{ hpa }> = ({ hpa }) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(editHPADialog(hpa));
  return (
    <ActionButton
      title={translate('Edit')}
      action={callback}
      iconNode={<PencilSimple />}
    />
  );
};
