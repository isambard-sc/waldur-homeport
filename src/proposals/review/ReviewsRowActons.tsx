import { useSelector } from 'react-redux';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { ReviewItemAction } from './ReviewItemActions';
import { ReviewViewAction } from './ReviewViewAction';

export const ReviewsRowActions = ({ row, fetch }) => {
  const user = useSelector(getUser);
  const hasPermission = user.is_staff || row.reviewer_uuid === user.uuid;
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[ReviewViewAction, hasPermission && ReviewItemAction].filter(
        Boolean,
      )}
    />
  );
};
