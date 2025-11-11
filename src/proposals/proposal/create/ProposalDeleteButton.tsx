import { TrashIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { proposalProposalsDestroy } from 'waldur-js-client';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface ProposalDeleteButtonProps {
  proposal: {
    uuid: string;
    name: string;
  };
}

export const ProposalDeleteButton = ({
  proposal,
}: ProposalDeleteButtonProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete the proposal "{name}"?', {
          name: proposal.name,
        }),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    setDeleting(true);
    try {
      await proposalProposalsDestroy({ path: { uuid: proposal.uuid } });
      dispatch(showSuccess(translate('Proposal deleted successfully.')));
      router.stateService.go('proposals-all-proposals');
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to delete proposal.')));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="danger"
      onClick={handleDelete}
      className="w-100 mt-2"
      disabled={deleting}
    >
      {deleting && <LoadingSpinnerIcon className="me-1" />}
      <TrashIcon weight="bold" className="me-1" />
      {translate('Delete')}
    </Button>
  );
};
