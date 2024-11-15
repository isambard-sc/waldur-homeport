import { EventGroup } from '@waldur/events/types';
import { getUserContext } from '@waldur/events/utils';
import { translate } from '@waldur/i18n';

import { AuthEnum, UsersEnum } from '../EventsEnums';

export const AuthEvents: EventGroup = {
  title: translate('Authentication events'),
  context: getUserContext,
  events: [
    {
      key: AuthEnum.auth_logged_in_with_username,
      title: translate(
        'User {user_link} authenticated successfully with username and password.',
      ),
    },
    {
      key: UsersEnum.auth_logged_in_with_saml2,
      title: translate(
        'User {user_link} authenticated successfully with SAML2.',
      ),
    },
    {
      key: UsersEnum.auth_logged_out_with_saml2,
      title: translate('User {user_link} logged out successfully with SAML2.'),
    },
  ],
};
