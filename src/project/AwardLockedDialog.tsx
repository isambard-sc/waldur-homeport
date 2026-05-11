import { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import type { AwardDetails } from '@waldur/openportal/bindings/AwardDetails';

interface AwardLockedDialogProps {
  resolve: {
    awardDetails: AwardDetails;
    title: string;
    message: string;
  };
}

export const AwardLockedDialog: FunctionComponent<AwardLockedDialogProps> = ({
  resolve: { awardDetails, title, message },
}) => {
  const awardUrl = awardDetails.award?.url;
  const awardLabel = awardDetails.award?.id || awardDetails.award?.url;

  return (
    <>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        {awardUrl && (
          <a href={awardUrl} target="_blank" rel="noopener noreferrer">
            {awardLabel || awardUrl}
          </a>
        )}
      </Modal.Body>
      <Modal.Footer>
        {awardUrl && (
          <a
            href={awardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            {translate('Go to award')}
          </a>
        )}
        <CloseDialogButton label={translate('Close')} variant="secondary" />
      </Modal.Footer>
    </>
  );
};
