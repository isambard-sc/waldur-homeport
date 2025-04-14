import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { UserDetailsButton } from '@waldur/user/support/UserDetailsButton';

export const ProviderUsersRowActions = ({ row }) => {
  return <ActionsDropdown row={row} actions={[UserDetailsButton]} />;
};
