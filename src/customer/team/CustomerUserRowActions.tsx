import { FunctionComponent } from 'react';

import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { UserDetailsButton } from '@waldur/user/UserDetailsButton';

import { AddProjectUserButton } from './AddProjectUserButton';
import { UserEditButton } from './UserEditButton';
import { UserRemoveButton } from './UserRemoveButton';

interface CustomerUserRowActionsProps {
  refetch;
  row;
}

export const CustomerUserRowActions: FunctionComponent<
  CustomerUserRowActionsProps
> = ({ row, refetch }) => {
  return (
    <ActionsDropdownComponent>
      <UserDetailsButton userId={row.uuid} asDropdownItem />
      <UserEditButton customer={row} refetch={refetch} />
      <AddProjectUserButton customer={row} refetch={refetch} asDropdownItem />
      <UserRemoveButton customer={row} refetch={refetch} />
    </ActionsDropdownComponent>
  );
};
