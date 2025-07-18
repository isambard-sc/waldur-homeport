import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const RoleMappingFormDialog = lazyComponent(() =>
  import('./RoleMappingFormDialog').then((module) => ({
    default: module.RoleMappingFormDialog,
  })),
);

export const RoleMappingCreateButton: FunctionComponent<{ refetch; call }> = ({
  refetch,
  call,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(RoleMappingFormDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          call,
          refetch,
        },
        size: 'sm',
      }),
    );
  return <AddButton action={callback} />;
};
