import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { HookRemoveButton } from '@waldur/user/hooks/HookRemoveButton';

import { HookUpdateButton } from './HookUpdateButton';

export const HooksRowActions = ({ row, refetch, url }) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[
      HookUpdateButton,
      (props) => <HookRemoveButton {...props} refetch={refetch} url={url} />,
    ].filter(Boolean)}
  />
);
