import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { proposalReviewsAccept, proposalReviewsReject } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { router } from '@waldur/router';
import { useNotify } from '@waldur/store/hooks';

import { ProposalReview } from '../types';

export const useReviewActions = (review: ProposalReview, refetch = null) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();

  const { mutate: accept, isPending: isAccepting } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Start review'),
          translate(
            'Are you sure you want to start reviewing proposal {name}?',
            {
              name: <b>{review.proposal_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalReviewsAccept({ path: { uuid: review.uuid } });
        if (refetch) refetch();
        showSuccess(translate('Review has been accepted.'));

        try {
          router.stateService.go('proposal-review-view', {
            review_uuid: review.uuid,
          });
        } catch (e) {
          showErrorResponse(
            e,
            translate(
              'Review accepted, error while redirecting to review view page.',
            ),
          );
        }
      } catch (response) {
        showErrorResponse(response, translate('Unable to accept review.'));
      }
    },
  });
  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      let rejectionReason: string;
      try {
        rejectionReason = await waitForConfirmation(
          dispatch,
          translate('Reject review'),
          translate(
            'Are you sure you want to reject the {name} proposal review?',
            {
              name: <b>{review.proposal_name}</b>,
            },
            formatJsxTemplate,
          ),
          {
            showInput: true,
            inputLabel: translate('Additional details (optional)'),
            inputPlaceholder: translate(
              'Provide any additional details about your rejection',
            ),
            inputRequired: true,
            inputRows: 4,
            inputMaxLength: 400,
            inputCheckboxes: [
              {
                label: translate('Too busy'),
                value: translate('Too busy'),
              },
              {
                label: translate('Conflict of interest'),
                value: translate('Conflict of interest'),
              },
              {
                label: translate('Outside area of expertise'),
                value: translate('Outside area of expertise'),
              },
            ],
          },
        );
      } catch {
        return;
      }
      try {
        await proposalReviewsReject({
          path: { uuid: review.uuid },
          body: { summary_private_comment: rejectionReason },
        });
        if (refetch) refetch();
        dispatch(showSuccess(translate('Review has been rejected.')));
      } catch (response) {
        dispatch(
          showErrorResponse(response, translate('Unable to reject review.')),
        );
      }
    },
  });

  return {
    accept,
    isAccepting,
    reject,
    isRejecting,
  };
};
