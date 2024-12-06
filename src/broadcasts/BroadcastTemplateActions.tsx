import { useSelector } from 'react-redux';

import { BroadcastTemplateDeleteButton } from '@waldur/broadcasts/BroadcastTemplateDeleteButton';
import { BroadcastTemplateUpdateButton } from '@waldur/broadcasts/BroadcastTemplateUpdateButton';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

export const BroadcastTemplateActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  if (isStaff) {
    return (
      <ActionsDropdown
        row={row}
        refetch={refetch}
        actions={[BroadcastTemplateUpdateButton, BroadcastTemplateDeleteButton]}
      />
    );
  } else {
    return null;
  }
};
