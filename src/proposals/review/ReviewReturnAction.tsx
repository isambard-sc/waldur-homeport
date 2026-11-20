import { ArrowUUpLeftIcon } from '@phosphor-icons/react';
import { proposalReviewsReturnToReviewer } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { canReturnProposal } from '@/proposals/returns/permissions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

interface ReviewReturnActionProps {
  row: {
    uuid: string;
    state?: string;
    proposal_name?: string;
    reviewer_full_name?: string;
    call_uuid?: string;
    call_managing_organisation_uuid?: string;
  };
  refetch?(): void;
}

/**
 * Hands a submitted review back to its reviewer to change, with what to
 * change. For those who decide the call's proposals; the backend also
 * refuses once the proposal is decided, and says so.
 */
export const ReviewReturnAction = ({
  row,
  refetch,
}: ReviewReturnActionProps) => {
  const user = useUser();
  const { mutate, isPending } = useManagedMutation<any, any, { input: string }>(
    {
      mutationFn: (variables) =>
        proposalReviewsReturnToReviewer({
          path: { uuid: row.uuid },
          body: { reason: variables.input.trim() },
        }),
      refetch,
      confirmation: {
        title: translate('Return to reviewer'),
        body: translate(
          'Return the review of {proposal} to {reviewer}? It goes back to them to change and submit again.',
          {
            proposal: <strong>{row.proposal_name}</strong>,
            reviewer: <strong>{row.reviewer_full_name}</strong>,
          },
          formatJsxTemplate,
        ),
        options: {
          showInput: true,
          inputMultiline: true,
          inputRequired: true,
          inputLabel: translate(
            'What should the reviewer change? This is sent to them.',
          ),
          positiveButton: translate('Return to reviewer'),
        },
      },
      successMessage: translate(
        'The review has been returned to its reviewer.',
      ),
      errorMessage: translate('Unable to return the review.'),
    },
  );

  if (row.state !== 'submitted' || !canReturnProposal(user, row)) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Return to reviewer')}
      action={() => mutate(undefined)}
      disabled={isPending}
      iconNode={<ArrowUUpLeftIcon weight="bold" />}
    />
  );
};
