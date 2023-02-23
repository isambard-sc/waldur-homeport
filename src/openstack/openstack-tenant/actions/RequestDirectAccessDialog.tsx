import { useEffect, FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

export const RequestDirectAccessDialog: FunctionComponent<{
  resolve: { resource };
  close;
}> = ({ resolve: { resource }, close }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (ENV.plugins.WALDUR_SUPPORT) {
      close();
      dispatch(
        openIssueCreateDialog({
          issue: {
            type: ISSUE_IDS.SERVICE_REQUEST,
            summary: translate('Request direct access to OpenStack Tenant'),
            resource,
          },
          options: {
            title: translate('Request direct access to OpenStack Tenant'),
            descriptionPlaceholder: translate('Please provide a reason'),
            descriptionLabel: translate('Description'),
            hideTitle: true,
          },
          hideProjectAndResourceFields: Boolean(resource.project),
        }),
      );
    }
  });
  return (
    <>
      <Modal.Header>
        <Modal.Title>
          {translate('Request direct access to {name}', {
            name: resource.name,
          })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {translate(
            'To get access, please send a request to {supportEmail}.',
            { supportEmail: ENV.plugins.WALDUR_CORE.SITE_EMAIL },
          )}
        </p>
        <p>
          {translate(
            'Please note that request should specify tenant and provide a reason.',
          )}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton label={translate('Ok')} />
      </Modal.Footer>
    </>
  );
};
