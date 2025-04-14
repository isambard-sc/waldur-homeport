import { Eye } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

interface ProposalReviewsDetailButtonProps {
  row: any;
}

export const ProposalReviewsDetailButton: React.FC<
  ProposalReviewsDetailButtonProps
> = ({ row }) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <ActionItem
        action={() => openModal()}
        title={translate('Details')}
        iconNode={<Eye weight="bold" />}
        size="sm"
      />
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton className="without-border pb-0">
          <Modal.Title className="fw-bold">
            {translate('Review details')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="border-0">
          <StringField
            label={translate('Public comment')}
            name="summary_public_comment"
            disabled={true}
            placeholder={row.summary_public_comment}
          />
          <br />
          <StringField
            label={translate('Private comment')}
            name="summary_private_comment"
            disabled={true}
            placeholder={row.summary_private_comment}
          />
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2">
          <Button variant="outline btn-outline-default" onClick={closeModal}>
            {translate('Close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
