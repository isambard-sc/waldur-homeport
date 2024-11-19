import { PencilSimple } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { DropdownLink } from './DropdownLink';

export const EditOfferingButton = ({ row }) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);

  const canUpdateOffering = hasPermission(user, {
    permission: PermissionEnum.UPDATE_OFFERING,
    customerId: row.customer_uuid,
  });

  const targetState =
    row.customer_uuid !== customer?.uuid
      ? 'admin-marketplace-offering-update'
      : 'marketplace-offering-update';

  if (!canUpdateOffering) {
    return null;
  }

  return (
    <Dropdown.Item
      as={DropdownLink}
      state={targetState}
      params={{
        offering_uuid: row.uuid,
        uuid: row.customer_uuid,
      }}
    >
      <span className="svg-icon svg-icon-2">
        <PencilSimple />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};
