import { useRouter } from '@uirouter/react';
import { Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Proposal, ProposalReview, PublicCall } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { checkIsCallManager } from '@waldur/proposals/utils';
import { RootState } from '@waldur/store/reducers';
import {
  checkCustomerUser,
  getUser,
} from '@waldur/workspace/selectors';

export const ProposalRoleBasedTabs = ({
  proposal,
  review,
  call,
}: {
  proposal: Proposal;
  /** user review */
  review: ProposalReview;
  call: PublicCall;
}) => {
  const router = useRouter();
  const goTo = (state: string) => {
    const params = {};
    if (
      [
        'proposals.manage-proposal',
        'call-management.proposal-details',
      ].includes(state)
    ) {
      Object.assign(params, { proposal_uuid: proposal.uuid });
      if (
        ['proposal-review-view', 'proposal-review'].includes(
          router.globals.current.name,
        )
      ) {
        // Save the review uuid in the url, so we don't lose it and can come back to it if there are other reviews
        Object.assign(params, { review_uuid: review.uuid });
      }
    } else if (['proposal-review-view', 'proposal-review'].includes(state)) {
      Object.assign(params, { review_uuid: review.uuid });
    }

    // Add call's organization uuid if needed
    if (
      ['call-management.proposal-details', 'proposal-review'].includes(state)
    ) {
      Object.assign(params, { uuid: call.customer_uuid });
    }

    router.stateService.go(state, params);
  };

  const isStaffOrOwnerOrManager = useSelector((state: RootState) => {
    const user = getUser(state);
    if (user?.is_staff) return true;
    if (checkCustomerUser({ uuid: call?.customer_uuid } as any, user))
      return true;
    if (checkIsCallManager(call, user)) return true;
    return false;
  });
  const showCallManagement = isFeatureVisible(
    MarketplaceFeatures.show_call_management_functionality,
  );

  return (
    <Tabs
      defaultActiveKey={router.globals.current.name}
      className="nav-line-tabs mb-8"
      onSelect={goTo}
    >
      <Tab
        eventKey="proposals.manage-proposal"
        title={translate('Applicant')}
      />
      {review ? (
        <Tab
          eventKey={
            router.globals.current.parent === 'reviews'
              ? 'proposal-review-view'
              : 'proposal-review'
          }
          title={translate('Reviewer')}
        />
      ) : null}
      {isStaffOrOwnerOrManager && showCallManagement && (
        <Tab
          eventKey="call-management.proposal-details"
          title={translate('Call manager')}
          disabled={!call?.customer_uuid}
        />
      )}
    </Tabs>
  );
};
