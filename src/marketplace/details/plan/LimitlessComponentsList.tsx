import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';

import { Component } from './types';

export const LimitlessComponentsList = ({
  components,
}: {
  components: Component[];
}) => {
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );
  return (
    <>
      {components.map((component, index) => (
        <div key={index}>
          {component.name}:{' '}
          <span className="fw-bold">
            {!shouldConcealPrices &&
              formatCurrency(
                component.price,
                ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                4,
              )}
          </span>
        </div>
      ))}
    </>
  );
};
