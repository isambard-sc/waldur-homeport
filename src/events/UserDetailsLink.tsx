import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getUser } from '@waldur/workspace/selectors';

export const UserDetailsLink = ({ uuid, name }) => {
  const currentUser = useSelector(getUser);
  if (currentUser.is_staff || currentUser.is_support) {
    return (
      <Link state="users.details" params={{ uuid }}>
        {name}
      </Link>
    );
  } else {
    return name || 'N/A';
  }
};
