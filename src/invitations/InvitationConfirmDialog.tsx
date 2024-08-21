import { useRouter } from '@uirouter/react';
import { useCallback, FunctionComponent, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { getInvitationLinkProps } from '@waldur/administration/getInvitationLinkProps';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { InvitationButtons } from './InvitationButtons';
import { InvitationErrorMessage } from './InvitationErrorMessage';
import { InvitationMessage } from './InvitationMessage';
import { InvitationService } from './InvitationService';
import { formatInvitationState } from './InvitationStateFilter';

export const InvitationConfirmDialog: FunctionComponent<{
  resolve: { token; deferred };
}> = ({ resolve: { token, deferred } }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector(getUser);
  const asyncResult = useAsync(() =>
    InvitationService.details(token).then((response) => response.data),
  );
  const invitation = asyncResult.value;

  const close = useCallback(() => dispatch(closeModalDialog()), [dispatch]);

  const dismiss = useCallback(() => {
    deferred.reject();
    close();
  }, [close, deferred]);

  const closeAcceptingNewEmail = useCallback(() => {
    close();
    deferred.resolve({ replaceEmail: true, invitation });
  }, [close, deferred, invitation]);

  const closeDecliningNewEmail = useCallback(() => {
    close();
    deferred.resolve({ replaceEmail: false, invitation });
  }, [close, deferred, invitation]);

  useEffect(() => {
    if (invitation?.state === 'Accepted') {
      const linkProps = getInvitationLinkProps(invitation);
      if (linkProps) {
        router.stateService.go(linkProps.state, linkProps.params);
      }
    }
  }, [invitation]);

  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Invitation confirmation')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!user ? null : asyncResult.loading ? (
          <>
            <LoadingSpinner />
            <p className="text-center">
              {translate(
                'Please give us a moment to validate your invitation.',
              )}
            </p>
          </>
        ) : asyncResult.error ? (
          <InvitationErrorMessage dismiss={dismiss} />
        ) : invitation?.state === 'Pending' ? (
          <InvitationMessage invitation={invitation} user={user} />
        ) : invitation?.state ? (
          translate('Invitation is in {state}', {
            state: formatInvitationState(invitation.state),
          })
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        {!user ? null : invitation?.state === 'Pending' ? (
          <InvitationButtons
            user={user}
            invitation={invitation}
            dismiss={dismiss}
            closeAcceptingNewEmail={closeAcceptingNewEmail}
            closeDecliningNewEmail={closeDecliningNewEmail}
          />
        ) : null}
      </Modal.Footer>
    </>
  );
};
