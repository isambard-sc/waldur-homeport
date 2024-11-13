import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionMap } from '@waldur/permissions/enums';
import { checkScope } from '@waldur/permissions/hasPermission';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

import { InvitationContext } from './types';

const InvitationCreateDialog = lazyComponent(() =>
  import('./create/InvitationCreateDialog').then((module) => ({
    default: module.InvitationCreateDialog,
  })),
);

export const useCreateInvitation = (
  context: Omit<InvitationContext, 'customer' | 'user'>,
) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(InvitationCreateDialog, {
        size: 'xl',
        resolve: { ...context, user, customer },
      }),
    );

  const canInvite = useMemo(
    () =>
      context.roleTypes.some((roleType) => {
        let scope: any = context.scope;
        if (!scope) {
          switch (roleType) {
            case 'customer':
              scope = customer;
              break;
            case 'project':
              scope = context.project || project;
              break;
            default:
              return false;
          }
        }
        const permission = PermissionMap[roleType];
        return (
          checkScope(user, 'customer', customer.uuid, permission) ||
          checkScope(user, roleType, scope.uuid, permission)
        );
      }),
    [context, user, customer, project],
  );

  return { callback, canInvite };
};
