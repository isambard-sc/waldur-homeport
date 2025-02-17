import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { USER_FORM_ID } from './constants';

const AddUserDialog = lazyComponent(() =>
  import('./AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

export const AddUserButton: FunctionComponent<{
  resource;
  offering;
  refetch;
}> = ({ resource, offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(AddUserDialog, {
        resolve: { resource, offering, refetch },
        formId: USER_FORM_ID,
      }),
    );
  };
  return (
    <ActionButton
      iconNode={<PlusCircle />}
      title={translate('Assign user')}
      action={callback}
    />
  );
};
