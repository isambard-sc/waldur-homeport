import { useSelector } from 'react-redux';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

import { NotificationToggleButton } from './NotificationToggleButton';
import { NotificationUpdateButton } from './NotificationUpdateButton';

export const NotificationActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  if (isStaff) {
    return (
      <ActionsDropdown
        row={row}
        refetch={refetch}
        actions={[NotificationUpdateButton, NotificationToggleButton]}
      />
    );
  } else {
    return null;
  }
};
