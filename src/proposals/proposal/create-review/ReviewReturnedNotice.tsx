import { FC } from 'react';
import { ProposalReview } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';

/**
 * Tells a reviewer the call managers sent their review back, and why. Only
 * while it is with them again: once resubmitted, it is history.
 */
export const ReviewReturnedNotice: FC<{
  review?: Pick<ProposalReview, 'state' | 'return_reason' | 'returned_at'>;
}> = ({ review }) =>
  review?.return_reason && review.state === 'in_review' ? (
    <AlertItem
      variant="warning"
      className="mb-7"
      data-testid="review-returned-notice"
      title={translate(
        'The call managers returned this review to you on {date}:',
        { date: formatDateTime(review.returned_at) },
      )}
      body={<span className="text-pre-wrap">{review.return_reason}</span>}
    />
  ) : null;
