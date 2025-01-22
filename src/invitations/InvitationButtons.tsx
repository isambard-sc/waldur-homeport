import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const InvitationButtons = ({ dismiss, closeAcceptingInvitation }) => {
  return (
    <>
      <Button variant="primary" onClick={closeAcceptingInvitation}>
        {translate('Accept invitation')}
      </Button>
      <Button onClick={dismiss}>{translate('Cancel invitation')}</Button>
    </>
  );
};
