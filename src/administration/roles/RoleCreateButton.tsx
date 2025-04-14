import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { rolesCreate } from 'waldur-js-client';

import { AddButton } from '@waldur/core/AddButton';
import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';

import { getRoles } from './utils';

const RoleCreateDialog = lazyComponent(() =>
  import('./RoleCreateDialog').then((module) => ({
    default: module.RoleCreateDialog,
  })),
);

export const RoleCreateButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openRoleCreateDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(RoleCreateDialog, {
          submitFn: async (formData) => {
            await rolesCreate({ body: formData });
            ENV.roles = await getRoles();
            dispatch(closeModalDialog());
            refetch();
          },
        }),
      ),
    [dispatch],
  );

  return <AddButton action={openRoleCreateDialog} />;
};
