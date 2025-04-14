import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { showComponentsList } from '@waldur/marketplace/common/registry';

import { getAccountingTypeOptions } from './components/ComponentAccountingTypeField';
import { getLimitPeriods } from './components/ComponentLimitPeriodField';

export const parseAttribute = (attribute, value) => {
  if (Array.isArray(attribute.options)) {
    if (attribute.type === 'choice') {
      return attribute.options.find((opt) => opt.key === value);
    } else if (attribute.type === 'list' && Array.isArray(value)) {
      return value
        .map((choice) => attribute.options.find((opt) => opt.key === choice))
        .filter((x) => x !== undefined);
    }
  }
  return value;
};

export const parseComponent = (component) => {
  const options = getAccountingTypeOptions();
  const limitPeriods = getLimitPeriods();
  return {
    ...component,
    billing_type: options.find(
      (option) => option.value === component.billing_type,
    ),
    limit_period: limitPeriods.find(
      (option) => option.value === component.limit_period,
    ),
  };
};

export const useOfferingAccountingTableTabs = (offering) => {
  const { state } = useCurrentStateAndParams();
  return useMemo(
    () =>
      [
        showComponentsList(offering.type) && {
          key: 'components',
          title: translate('Components'),
          state: state.name,
          params: { tab: 'components' },
        },
        {
          key: 'plans',
          title: translate('Plans'),
          state: state.name,
          params: { tab: 'plans' },
        },
      ].filter(Boolean),
    [offering],
  );
};
