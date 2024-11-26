import { Trash } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { deleteProjectUser } from '@waldur/permissions/api';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { NestedCustomerPermission, NestedProjectPermission } from './types';

interface DeleteProjectUserButtonProps {
  customer: NestedCustomerPermission;
  project: NestedProjectPermission;
  refetch(): void;
}

export const DeleteProjectUserButton: React.FC<
  DeleteProjectUserButtonProps
> = ({ project, customer, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to remove {user} from {project}?', {
          user: customer.full_name || customer.username,
          project: project.name,
        }),
      );
    } catch {
      return;
    }

    try {
      await deleteProjectUser({
        project: project.uuid,
        user: customer.uuid,
        role: project.role_name,
      });
      refetch();
      dispatch(showSuccess(translate('Team member has been removed.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to delete team member.')),
      );
    }
  };
  return (
    <ActionItem
      className="text-danger border-top"
      iconColor="danger"
      title={translate('Remove')}
      action={callback}
      iconNode={<Trash weight="bold" />}
    />
  );
};
