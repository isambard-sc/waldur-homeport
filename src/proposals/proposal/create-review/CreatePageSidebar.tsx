import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { FloatingSubmitButton } from '@waldur/form/FloatingSubmitButton';
import { TosNotification } from '@waldur/form/TosNotification';
import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { useReviewActions } from '@waldur/proposals/review/utils';
import { ProposalReview } from '@waldur/proposals/types';
import { isReviewInFinalState } from '@waldur/proposals/utils';

import { createReviewSteps } from './steps/steps';

const tabs = createReviewSteps.map((step) => ({
  key: step.id,
  title: step.label,
}));

interface CreatePageSidebarProps {
  review: ProposalReview;
  submitting?: boolean;
  refetch?(): void;
}

export const CreatePageSidebar: FC<CreatePageSidebarProps> = ({
  review,
  submitting,
  refetch,
}) => {
  const { reject, isRejecting } = useReviewActions(review, refetch);
  return (
    <>
      <Panel title={translate('Progress')} cardBordered className="mb-5">
        <PageBarTabs tabs={tabs} mode="tabs-left" />
      </Panel>
      {review && !isReviewInFinalState(review.state) && (
        <>
          <FloatingSubmitButton
            submitting={submitting}
            label={translate('Submit review')}
            variant="primary"
          />
          <Button
            variant="secondary"
            onClick={reject as any}
            className="w-100 mt-2"
            disabled={submitting || isRejecting}
          >
            {isRejecting && <LoadingSpinnerIcon className="me-1" />}
            {translate('Send back')}
          </Button>
          <TosNotification className="text-center text-gray-500 mt-2" />
        </>
      )}
    </>
  );
};
