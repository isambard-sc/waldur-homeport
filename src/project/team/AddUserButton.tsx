import { PlusCircle } from '@phosphor-icons/react';
import React from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';
import { Project } from '@waldur/workspace/types';

const AddUserDialog = lazyComponent(() =>
  import('./AddUserDialog').then((module) => ({
    default: module.AddUserDialog,
  })),
);

export const AddUserButton: React.FC<{ project: Project; refetch }> = ({
  project,
  refetch,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  const canAddUser =
    hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      customerId: project.customer_uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT_PERMISSION,
      projectId: project.uuid,
    });
  if (!canAddUser) {
    return null;
  }
  return (
    <ActionButton
      action={() => openDialog(AddUserDialog, { refetch })}
      title={translate('Add user')}
      iconNode={<PlusCircle />}
    />
  );
};
