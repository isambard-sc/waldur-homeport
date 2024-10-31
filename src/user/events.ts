import { EventGroup } from '@waldur/events/types';
import { getAffectedUserContext, getUserContext } from '@waldur/events/utils';
import { gettext } from '@waldur/i18n';

import { SshEnum, UsersEnum } from '../EventsEnums';

export const UserEvents: EventGroup = {
  title: gettext('User management events'),
  context: getAffectedUserContext,
  events: [
    {
      key: UsersEnum.user_activated,
      title: gettext('User {affected_user_link} has been activated.'),
    },
    {
      key: UsersEnum.user_creation_succeeded,
      title: gettext('User {affected_user_link} has been created.'),
    },
    {
      key: UsersEnum.user_deactivated,
      title: gettext('User {affected_user_link} has been deactivated.'),
    },
    {
      key: UsersEnum.user_deletion_succeeded,
      title: gettext('User {affected_user_name} has been deleted.'),
    },
    {
      key: UsersEnum.user_password_updated,
      title: gettext(
        'Password has been changed for user {affected_user_link}.',
      ),
    },
    {
      key: UsersEnum.user_update_succeeded,
      title: gettext('User {affected_user_link} has been updated.'),
    },
  ],
};

export const SshEvents: EventGroup = {
  title: gettext('SSH key management events'),
  context: getUserContext,
  events: [
    {
      key: SshEnum.ssh_key_creation_succeeded,
      title: gettext(
        'SSH key {ssh_key_name} has been created for user {user_link}',
      ),
    },
    {
      key: SshEnum.ssh_key_deletion_succeeded,
      title: gettext(
        'SSH key {ssh_key_name} has been deleted for user {user_link}',
      ),
    },
  ],
};
