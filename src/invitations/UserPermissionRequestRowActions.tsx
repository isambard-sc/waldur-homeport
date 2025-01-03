import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { UserPermissionRequestApproveButton } from '@waldur/invitations/UserPermissionRequestApproveButton';
import { UserPermissionRequestRejectButton } from '@waldur/invitations/UserPermissionRequestRejectButton';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';

interface UserPermissionRequestRowActionsProps {
  refetch;
  row;
}

export const UserPermissionRequestRowActions: FunctionComponent<
  UserPermissionRequestRowActionsProps
> = ({ row, refetch }) => {
  const user = useUser();
  const canManageRequest =
    hasPermission(user, {
      permission: PermissionEnum.CREATE_CUSTOMER_PERMISSION,
      customerId: row.customer_uuid,
      projectId: row.project_uuid,
    }) || user.is_support;

  return row.state === 'pending' && canManageRequest ? (
    <ButtonGroup>
      <UserPermissionRequestApproveButton
        permissionRequest={row}
        refetch={refetch}
      />
      <UserPermissionRequestRejectButton
        permissionRequest={row}
        refetch={refetch}
      />
    </ButtonGroup>
  ) : null;
};
