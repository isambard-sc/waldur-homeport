import React from 'react';
import { useSelector } from 'react-redux';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

import { IdentityProviderCard } from './IdentityProviderCard';
import { TermsOfServiceCheckbox } from './TermsOfServiceCheckbox';
import { UserEditAvatarFormItem } from './UserEditAvatarFormItem';
import { UserEditRows } from './UserEditRows';

interface UserEditTabProps {
  user: UserDetails;
}

export const UserEditTab: React.FC<UserEditTabProps> = ({ user }) => {
  const currentUser = useSelector(getUser);

  return (
    <>
      <IdentityProviderCard user={user} />
      <FormTable.Card
        title={translate('Profile settings')}
        className="card-bordered mb-7"
      >
        <FormTable>
          {currentUser.uuid === user.uuid && (
            <FormTable.Item value={<TermsOfServiceCheckbox user={user} />} />
          )}
          <UserEditAvatarFormItem user={user} />
          <UserEditRows user={user} />
        </FormTable>
      </FormTable.Card>
    </>
  );
};
