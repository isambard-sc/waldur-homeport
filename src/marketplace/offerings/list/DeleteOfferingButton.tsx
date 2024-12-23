import { Trash } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

import { deleteProviderOffering } from '../../common/api';

export const DeleteOfferingButton = ({ row, refetch }) => {
  const user = useUser();
  const dispatch = useDispatch();

  const canDeleteOffering = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING,
    customerId: row.customer_uuid,
  });

  if (row.state != 'Draft' || row.resources_count || !canDeleteOffering) {
    return null;
  }

  const handleDeleteConfirmation = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete confirmation'),
        translate('Are you sure you want to delete this offering?'),
        true,
      );
    } catch {
      return;
    }
    try {
      await deleteProviderOffering(row.uuid);
      dispatch(showSuccess(translate('Offering deleted successfully.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Error while deleting offering.')),
      );
    }
  };

  return (
    <Dropdown.Item
      as="button"
      className="text-danger"
      onClick={() => {
        handleDeleteConfirmation();
      }}
    >
      <span className="svg-icon svg-icon-2">
        <Trash />
      </span>
      {translate('Delete')}
    </Dropdown.Item>
  );
};
