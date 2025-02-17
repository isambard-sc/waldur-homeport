import { Question } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { formatCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { Component } from './types';

interface TotalLimitComponentsListProps {
  components: Component[];
  total: number;
}

const getTipLabel = (component) =>
  component.type +
  ' ' +
  component.amount +
  ' ' +
  (component.measured_unit || 'N/A');

export const TotalLimitComponentsList: FunctionComponent<
  TotalLimitComponentsListProps
> = (props) => {
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );
  return (
    <Table bordered={true}>
      <thead>
        <tr>
          <th className="col-sm-1">{translate('Component name')}</th>
          {!shouldConcealPrices && (
            <th>
              {translate('Price per unit')}
              <PriceTooltip />
            </th>
          )}
          <th>{translate('Subtotal')}</th>
        </tr>
      </thead>
      <tbody>
        {props.components.map((component, index) => (
          <tr key={index}>
            <td>
              <span>
                {component.name}
                <Tip label={getTipLabel(component)} id="componentLimitTooltip">
                  {' '}
                  <Question />
                </Tip>
              </span>
            </td>
            {!shouldConcealPrices && (
              <td>
                {formatCurrency(
                  component.price,
                  ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                  4,
                )}
              </td>
            )}
            <td>
              {formatCurrency(
                component.subTotal,
                ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
                4,
              )}
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={3}>{translate('Total')}</td>
          <td>
            {formatCurrency(
              props.total,
              ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
              4,
            )}
          </td>
        </tr>
      </tbody>
    </Table>
  );
};
