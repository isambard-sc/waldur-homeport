import { ArrowUUpLeft } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { proposalReviewsReturnToReviewer } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ReviewReturnAction = (props) => {
  const dispatch = useDispatch();
  const [returning, setReturning] = useState(false);

  const openDialog = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to return the review for proposal {proposal_name} to the reviewer? This will change the review state to "In review".',
          { proposal_name: <strong>{props.row.proposal_name}</strong> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    setReturning(true);
    try {
      await proposalReviewsReturnToReviewer({
        path: { uuid: props.row.uuid },
      });
      props.refetch();
      dispatch(
        showSuccess(
          translate('Review returned to reviewer for further work.'),
        ),
      );
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to return review.')));
    } finally {
      setReturning(false);
    }
  }, [dispatch, setReturning, props]);

  return (
    <ActionItem
      title={translate('Return to reviewer')}
      action={openDialog}
      iconNode={<ArrowUUpLeft weight="bold" />}
      disabled={returning}
    />
  );
};
