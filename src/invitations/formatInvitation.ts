import { VisibleInvitationDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { RoleType } from '@waldur/permissions/types';
import { formatRoleType } from '@waldur/permissions/utils';

export const formatInvitation = (invitation: VisibleInvitationDetails) =>
  translate('{sender} has invited you to join {name} {type} in {role} role.', {
    sender: invitation.created_by_full_name || invitation.created_by_username,
    name: invitation.scope_name,
    type: formatRoleType(invitation.scope_type as RoleType),
    role: invitation.role_description,
  });
