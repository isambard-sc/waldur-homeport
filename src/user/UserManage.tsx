import { FunctionComponent } from 'react';
import { User } from 'waldur-js-client';

interface OwnProps {
  tabSpec;
  user: User;
  isPersonal?: boolean;
}

export const UserManage: FunctionComponent<OwnProps> = ({
  tabSpec,
  user,
  isPersonal,
}) => {
  if (tabSpec) {
    return (
      <tabSpec.component user={user} showDeleteButton={!isPersonal} hasHeader />
    );
  }
  return null;
};
