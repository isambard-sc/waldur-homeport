import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { userGroupInvitationsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { GroupInvitationButtons } from './GroupinvitationButtons';
import { GroupInvitationErrorMessage } from './GroupInvitationErrorMessage';
import { GroupInvitationMessage } from './GroupInvitationMessage';

export const GroupInvitationConfirmDialog: FunctionComponent<{
  resolve: { token; deferred };
}> = ({ resolve: { token, deferred } }) => {
  const dispatch = useDispatch();

  const close = useCallback(() => dispatch(closeModalDialog()), [dispatch]);

  const dismiss = useCallback(() => {
    deferred.reject();
    close();
  }, [close, deferred]);

  const submitRequest = useCallback(() => {
    close();
    deferred.resolve(true);
  }, [close, deferred]);

  const asyncResult = useAsync(() =>
    userGroupInvitationsRetrieve({ path: { uuid: token } }).then(
      (response) => response.data,
    ),
  );

  const invitation = asyncResult.value;

  return (
    <ModalDialog
      title={translate('Request permission')}
      footer={
        !asyncResult.loading &&
        !asyncResult.error && (
          <GroupInvitationButtons
            dismiss={dismiss}
            submitRequest={submitRequest}
          />
        )
      }
    >
      {asyncResult.loading && (
        <>
          <LoadingSpinner />
          <p className="text-center">
            {translate('Please give us a moment to validate your invitation.')}
          </p>
        </>
      )}
      {!asyncResult.loading &&
        (asyncResult.error ? (
          <GroupInvitationErrorMessage dismiss={dismiss} />
        ) : (
          <GroupInvitationMessage invitation={invitation} />
        ))}
    </ModalDialog>
  );
};
