import { Share } from '@phosphor-icons/react';
import { useMemo, FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser, getProject } from '@waldur/workspace/selectors';

import { InvitationService } from '../InvitationService';

import { InvitationPolicyService } from './InvitationPolicyService';

const statesForResend = ['pending', 'expired'];

export const InvitationSendButton: FunctionComponent<{ invitation }> = ({
  invitation,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const callback = async () => {
    try {
      await InvitationService.resend(invitation.uuid);
      dispatch(showSuccess(translate('Invitation has been sent again.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to resend invitation.')));
    }
  };

  const isDisabled = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        invitation,
      )
    ) {
      return true;
    }
    if (statesForResend.indexOf(invitation.state) === -1) {
      return true;
    }
    return false;
  }, [user, customer, invitation]);

  const tooltip = useMemo(() => {
    if (
      !InvitationPolicyService.canManageInvitation(
        { user, customer, project },
        invitation,
      )
    ) {
      return translate("You don't have permission to send this invitation.");
    }

    if (statesForResend.indexOf(invitation.state) === -1) {
      return translate(
        'Only pending and expired invitations can be sent again.',
      );
    }
  }, [user, customer, invitation]);

  return (
    <ActionButton
      action={callback}
      title={translate('Resend')}
      iconNode={<Share />}
      disabled={isDisabled}
      tooltip={tooltip}
    />
  );
};
