import ipRegex from 'ip-regex';
import { useMemo } from 'react';
import { getFormValues } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { useExtraTabs } from '@waldur/navigation/context';
import { useOfferingCategories } from '@waldur/navigation/sidebar/ResourcesMenu';
import { Tab } from '@waldur/navigation/Tab';
import { RootState } from '@waldur/store/reducers';

import { getCategoryItems } from './category/utils';

export const orderFormDataSelector = (state: RootState) =>
  (getFormValues(ORDER_FORM_ID)(state) || {}) as any;

export const orderFormAttributesSelector = (state: RootState) => {
  const formData = orderFormDataSelector(state);
  return formData.attributes || {};
};

export const formatResourceShort = (resource) => {
  return (
    (resource.name ? resource.name : resource.uuid) +
    ' (' +
    resource.offering_name +
    ')'
  );
};

export const isExperimentalUiComponentsVisible = () =>
  isFeatureVisible(MarketplaceFeatures.show_experimental_ui_components);

const IPv4_ADDRESS_PATTERN = ipRegex.v4({ exact: true });
const IPv6_ADDRESS_PATTERN = ipRegex.v6({ exact: true });

export const validateIP = (value) => {
  if (!value) return false;
  return IPv4_ADDRESS_PATTERN.test(value) || IPv6_ADDRESS_PATTERN.test(value);
};

export const useMarketplacePublicTabs = () => {
  const categories = useOfferingCategories();

  const tabs = useMemo(() => {
    const _tabs: Tab[] = [
      {
        title: translate('Dashboard'),
        to: 'public.marketplace-landing',
      },
      {
        title: translate('Service providers'),
        to: 'public.marketplace-providers',
      },
      {
        title: translate('Orders'),
        to: 'public.marketplace-orders',
      },
    ];
    return _tabs.concat(getCategoryItems(categories || []));
  }, [categories]);
  useExtraTabs(tabs);
};
