import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const UserAgreementCreateDialog = lazyComponent(() =>
  import('./UserAgreementCreateDialog').then((module) => ({
    default: module.UserAgreementCreateDialog,
  })),
);

export const UserAgreementCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(UserAgreementCreateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
        },
        size: 'lg',
      }),
    );
  return <AddButton action={callback} />;
};
