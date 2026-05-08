import { FunctionComponent } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import type { AwardDetails } from '@waldur/openportal/bindings/AwardDetails';

interface MembershipLockedDialogProps {
  resolve: { awardDetails: AwardDetails };
}

export const MembershipLockedDialog: FunctionComponent<MembershipLockedDialogProps> = ({
  resolve: { awardDetails },
}) => {
  const awardUrl = awardDetails.award?.url;
  const awardLabel = awardDetails.award?.id || awardDetails.award?.url;

  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Membership controlled by award')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {translate(
            'Membership for this project is controlled through the funding award. To add or remove members, visit the award page.',
          )}
        </p>
        {awardUrl && (
          <a href={awardUrl} target="_blank" rel="noopener noreferrer">
            {awardLabel || awardUrl}
          </a>
        )}
      </Modal.Body>
      <Modal.Footer>
        {awardUrl && (
          <Button
            variant="primary"
            href={awardUrl}
            target="_blank"
            rel="noopener noreferrer"
            as="a"
          >
            {translate('Go to award')}
          </Button>
        )}
        <Button variant="secondary" data-bs-dismiss="modal">
          {translate('Close')}
        </Button>
      </Modal.Footer>
    </>
  );
};
