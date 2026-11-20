import { ProposalReview } from 'waldur-js-client';

import { ReviewReturnAction } from '@/proposals/review/ReviewReturnAction';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ShowReviewCommentsAction } from './ShowReviewCommentsAction';

type ProposalReviewsRowActionsProps = {
  row: ProposalReview;
  fetch?(): void;
};

export const ProposalReviewsRowActions = ({
  row,
  fetch,
}: ProposalReviewsRowActionsProps) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[ShowReviewCommentsAction, ReviewReturnAction]}
  />
);
