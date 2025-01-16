import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getCategory, getPublicOffering } from '@waldur/marketplace/common/api';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import { getUser } from '@waldur/workspace/selectors';

import { isExperimentalUiComponentsVisible } from '../utils';

import { PUBLIC_OFFERING_DATA_QUERY_KEY } from './constants';
import { OfferingViewHero } from './OfferingViewHero';
import { getPublicOfferingBreadcrumbItems } from './utils';

const PublicOfferingInfo = lazyComponent(() =>
  import('./details/PublicOfferingInfo').then((module) => ({
    default: module.PublicOfferingInfo,
  })),
);
const PublicOfferingComponents = lazyComponent(() =>
  import('./details/PublicOfferingComponents').then((module) => ({
    default: module.PublicOfferingComponents,
  })),
);
const PublicOfferingImages = lazyComponent(() =>
  import('./details/PublicOfferingImages').then((module) => ({
    default: module.PublicOfferingImages,
  })),
);
const PublicOfferingGettingStarted = lazyComponent(() =>
  import('./details/PublicOfferingGettingStarted').then((module) => ({
    default: module.PublicOfferingGettingStarted,
  })),
);
const PublicOfferingFAQ = lazyComponent(() =>
  import('./details/PublicOfferingFAQ').then((module) => ({
    default: module.PublicOfferingFAQ,
  })),
);
const PublicOfferingReviews = lazyComponent(() =>
  import('./details/PublicOfferingReviews').then((module) => ({
    default: module.PublicOfferingReviews,
  })),
);
const PublicOfferingPricing = lazyComponent(() =>
  import('./details/PublicOfferingPricing').then((module) => ({
    default: module.PublicOfferingPricing,
  })),
);
const PublicOfferingLocation = lazyComponent(() =>
  import('./details/PublicOfferingLocation').then((module) => ({
    default: module.PublicOfferingLocation,
  })),
);
const PublicOfferingGetHelp = lazyComponent(() =>
  import('./details/PublicOfferingGetHelp').then((module) => ({
    default: module.PublicOfferingGetHelp,
  })),
);

const getTabs = (offering?): PageBarTab[] => {
  if (!offering) {
    // Return an empty array or placeholders until the offering is loaded
    return [];
  }
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const showDescriptionTab =
    offering?.full_description || offering?.attributes.length;

  const showGettingStartedTab = offering?.getting_started;

  return [
    showDescriptionTab && {
      title: translate('Description'),
      key: 'description',
      component: PublicOfferingInfo,
    },
    showGettingStartedTab
      ? {
          title: translate('Getting started'),
          key: 'getting-started',
          component: PublicOfferingGettingStarted,
        }
      : null,
    isFeatureVisible(MarketplaceFeatures.catalogue_only)
      ? null
      : {
          title: translate('Pricing'),
          key: 'pricing',
          component: PublicOfferingPricing,
        },
    isFeatureVisible(MarketplaceFeatures.catalogue_only)
      ? null
      : {
          title: translate('Components'),
          key: 'components',
          component: PublicOfferingComponents,
        },
    offering?.screenshots.length
      ? {
          title: translate('Images'),
          key: 'images',
          component: PublicOfferingImages,
        }
      : null,
    showExperimentalUiComponents
      ? {
          title: translate('FAQ'),
          key: 'faq',
          component: PublicOfferingFAQ,
        }
      : null,
    showExperimentalUiComponents
      ? {
          title: translate('Reviews'),
          key: 'reviews',
          component: PublicOfferingReviews,
        }
      : null,
    offering.latitude && offering.longitude
      ? {
          title: translate('Location'),
          key: 'location',
          component: PublicOfferingLocation,
        }
      : null,
    showExperimentalUiComponents
      ? {
          title: translate('Get help'),
          key: 'get-help',
          component: PublicOfferingGetHelp,
        }
      : null,
  ].filter(Boolean);
};

export const OfferingPublicUIView = () => {
  const dispatch = useDispatch();

  const {
    params: { uuid },
  } = useCurrentStateAndParams();

  const user = useSelector(getUser);

  const { isLoading, error, data, refetch, isRefetching } = useQuery(
    [PUBLIC_OFFERING_DATA_QUERY_KEY, uuid, user?.uuid],
    async () => {
      const options = user ? undefined : ANONYMOUS_CONFIG;
      const offering = await getPublicOffering(uuid, options);
      const category = await getCategory(offering.category_uuid, options);
      return { offering, category };
    },
    { refetchOnWindowFocus: false, staleTime: 3 * 60 * 1000 },
  );

  const tabs = useMemo(() => getTabs(data?.offering), [data]);
  const { tabSpec } = usePageTabsTransmitter(tabs);

  usePageHero(
    <OfferingViewHero
      offering={data?.offering}
      refetch={refetch}
      isLoading={isLoading}
      isRefetching={isRefetching}
      error={error}
      isPublic
    />,
    [data?.offering, isRefetching, refetch, error, isLoading],
  );

  const router = useRouter();
  const breadcrumbItems = useMemo(
    () => getPublicOfferingBreadcrumbItems(data?.offering, dispatch, router),
    [data?.offering, dispatch, router],
  );
  useBreadcrumbs(breadcrumbItems);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refetch={refetch}
          data={data}
          isLoading={isLoading}
          error={error}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
