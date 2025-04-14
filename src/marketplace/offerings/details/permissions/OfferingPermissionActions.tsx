import { OfferingPermissionRemoveButton } from '@waldur/marketplace/service-providers/OfferingPermissionRemoveButton';
import { UpdateOfferingPermissionExpirationTimeButton } from '@waldur/marketplace/service-providers/UpdateOfferingPermissionExpirationTimeButton';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

export const OfferingPermissionActions = ({ row, fetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        UpdateOfferingPermissionExpirationTimeButton,
        OfferingPermissionRemoveButton,
      ]}
    />
  );
};
