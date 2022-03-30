import { useEffect, FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

export const RequestActionDialog: FunctionComponent<{
  resolve: { offering; offeringRequestMode };
  close;
}> = ({ resolve: { offering, offeringRequestMode }, close }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  useEffect(() => {
    if (ENV.plugins.WALDUR_SUPPORT) {
      close();
      dispatch(
        openIssueCreateDialog({
          issue: {
            type: ISSUE_IDS.SERVICE_REQUEST,
            summary: translate('Request {mode} of public offering', {
              mode: offeringRequestMode,
            }),
            description:
              offeringRequestMode === 'publishing'
                ? translate(
                    'Please review and activate offering {offeringName} ({offeringUuid}). \n' +
                      'Requestor: {userName} / {userUuid}. \n' +
                      'Service provider: {customerName} / {customerUuid}',
                    {
                      offeringName: offering.name,
                      offeringUuid: offering.uuid,
                      userName: user.full_name,
                      userUuid: user.uuid,
                      customerName: customer.name,
                      customerUuid: customer.uuid,
                    },
                  )
                : translate(
                    'Please open offering {offeringName} ({offeringUuid}) for editing. \n' +
                      'Requestor: {userName} / {userUuid}. \n' +
                      'Service provider: {customerName} / {customerUuid}',
                    {
                      offeringName: offering.name,
                      offeringUuid: offering.uuid,
                      userName: user.full_name,
                      userUuid: user.uuid,
                      customerName: customer.name,
                      customerUuid: customer.uuid,
                    },
                  ),
            resource: {
              ...offering,
              url: undefined,
            },
            offeringRequestMode,
          },
          options: {
            title: translate('Request {mode} of public offering', {
              mode: offeringRequestMode,
            }),
            descriptionPlaceholder: translate('Please provide a reason'),
            descriptionLabel: translate('Description'),
            hideTitle: true,
          },
        }),
      );
    }
  });
  return (
    <>
      <Modal.Header>
        <Modal.Title>
          {translate('Request {mode} of {name}', {
            name: offering.name,
            mode: offeringRequestMode,
          })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {translate(
            'Please note that request should specify offering and provide a reason.',
          )}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton />
      </Modal.Footer>
    </>
  );
};
