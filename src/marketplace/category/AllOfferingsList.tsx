import { useCurrentStateAndParams } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { useExtraToolbar, useToolbarActions } from '@waldur/navigation/context';

import { PageBarFilters } from '../landing/filter/PageBarFilters';
import { getMarketplaceFilters } from '../landing/filter/store/selectors';
import { MarketplaceLandingFilter } from '../landing/MarketplaceLandingFilter';
import { useMarketplacePublicTabs } from '../utils';

import { PublicOfferingsList } from './PublicOfferingsList';

export const AllOfferingsList = () => {
  const {
    params: { initialMode },
  } = useCurrentStateAndParams();

  useMarketplacePublicTabs();
  const filters = useSelector(getMarketplaceFilters);
  useToolbarActions(<MarketplaceLandingFilter />);
  useExtraToolbar(filters.length ? <PageBarFilters /> : null, [filters]);

  return (
    <PublicOfferingsList
      showCategory
      showOrganization={false}
      initialMode={initialMode}
    />
  );
};
