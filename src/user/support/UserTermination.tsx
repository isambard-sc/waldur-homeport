import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { UserDelete } from './UserDelete';
import { UserStatus } from './UserStatus';

export const UserTermination = ({ user }: { user: UserDetails }) => {
  const currentUser = useSelector(getUser);
  return currentUser.is_staff ? (
    <>
      <UserDelete user={user} />
      <UserStatus user={user} />
    </>
  ) : null;
};
