import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { UserManageContainer } from '@waldur/user/UserManageContainer';
import { useUser } from '@waldur/workspace/hooks';

export const PersonalManageContainer: FunctionComponent = () => {
  const user = useUser();
  if (!user) {
    return <LoadingSpinner />;
  }
  return <UserManageContainer isPersonal />;
};
