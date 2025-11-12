import { ChatTeardropTextIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { proposalReviewsList } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { MenuAccordion } from '@waldur/navigation/sidebar/MenuAccordion';
import { MenuItem } from '@waldur/navigation/sidebar/MenuItem';
import { useUser } from '@waldur/workspace/hooks';

import { isDescendantOf } from '../useTabs';

export const CallPublicMenu = () => {
  const { state } = useCurrentStateAndParams();
  const user = useUser();

  // Check if user has any reviews assigned
  const { data: hasReviews = false } = useQuery({
    queryKey: ['userReviewsCheck', user?.uuid],
    queryFn: async () => {
      if (!user?.uuid) return false;
      // Staff and support users should always see Reviews menu
      if (user.is_staff || user.is_support) return true;
      try {
        const response = await proposalReviewsList({
          query: {
            reviewer_uuid: user.uuid,
            page_size: 1, // Only need to check if any exist
          },
        });
        return response.data.length > 0;
      } catch (error) {
        return false;
      }
    },
    enabled: !!user?.uuid,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isFeatureVisible(MarketplaceFeatures.call_only)) {
    return (
      <MenuItem
        title={translate('Calls for proposals')}
        state="calls-for-proposals-dashboard"
        icon={<ChatTeardropTextIcon weight="bold" />}
        child={false}
      />
    );
  }
  if (
    !isFeatureVisible(MarketplaceFeatures.show_call_management_functionality)
  ) {
    return null;
  }
  return (
    <MenuAccordion
      title={translate('Calls')}
      itemId="calls-menu"
      icon={<ChatTeardropTextIcon weight="bold" />}
    >
      <MenuItem
        title={translate('Calls for proposals')}
        state="calls-for-proposals-dashboard"
        activeState={
          ['calls-for-proposals', 'protected-call', 'public-calls'].some(
            (name) => isDescendantOf(name, state),
          )
            ? state.name
            : undefined
        }
      />

      <MenuItem
        title={translate('Proposals')}
        state="proposals-all-proposals"
        activeState={
          isDescendantOf('proposals', state) ? state.name : undefined
        }
      />

      {hasReviews ? (
        <MenuItem title={translate('Reviews')} state="reviews-all-reviews" />
      ) : null}
    </MenuAccordion>
  );
};
