import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { UserDetailsButton } from '@waldur/user/UserDetailsButton';

import { EditUserButton } from './EditUserButton';
import { UserRemoveButton } from './UserRemoveButton';

export const ProjectPermisionActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[
      (props) => (
        <UserDetailsButton {...props} userId={row.user_uuid} asDropdownItem />
      ),
      EditUserButton,
      UserRemoveButton,
    ]}
  />
);
