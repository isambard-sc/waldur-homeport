import { Link } from '@waldur/core/Link';
import { useUser } from '@waldur/workspace/hooks';

export const UserDetailsLink = ({ uuid, name }) => {
  const currentUser = useUser();
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
