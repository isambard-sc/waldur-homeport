import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { BroadcastSendButton } from './BroadcastSendButton';
import { BroadcastUpdateButton } from './BroadcastUpdateButton';

export const BroadcastsRowActions = ({ row, fetch }) => {
  if (row.state !== 'DRAFT') {
    return 'N/A';
  }
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[BroadcastUpdateButton, BroadcastSendButton].filter(Boolean)}
    />
  );
};
