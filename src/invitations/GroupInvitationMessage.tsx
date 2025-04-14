import { FunctionComponent } from 'react';
import { Invitation } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { formatInvitation } from './formatInvitation';

export const GroupInvitationMessage: FunctionComponent<{
  invitation: Invitation;
}> = ({ invitation }) => (
  <>
    <p>{formatInvitation(invitation)}</p>
    {translate('Do you want to submit permission request?')}
  </>
);
