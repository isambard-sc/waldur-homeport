import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { formatRole } from '@waldur/permissions/utils';

import { Invitation } from './types';

export const GroupInvitationMessage: FunctionComponent<{
  invitation: Invitation;
}> = ({ invitation }) => (
  <>
    <p>
      {translate(
        '{sender} has invited you to join {name} {type} in {role} role.',
        {
          sender:
            invitation.created_by_full_name || invitation.created_by_username,
          name: invitation.customer_name || invitation.project_name,
          type: invitation.project_name
            ? translate('project')
            : translate('organization'),
          role: formatRole(invitation.project_role || invitation.customer_role),
        },
      )}
    </p>
    {translate('Do you want to submit permission request?')}
  </>
);
