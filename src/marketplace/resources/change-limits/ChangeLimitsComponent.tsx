import React from 'react';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { translate } from '@waldur/i18n';
import { OfferingLimits } from '@waldur/marketplace/offerings/store/types';
import { Plan } from '@waldur/marketplace/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { ComponentRow } from './ComponentRow';
import { ComponentTotalRow } from './ComponentTotalRow';
import { StateProps } from './connector';

interface ChangeLimitsComponentProps extends StateProps {
  plan: Plan;
  offeringLimits: OfferingLimits;
}

export const ChangeLimitsComponent: React.FC<ChangeLimitsComponentProps> = (
  props,
) => {
  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });

  const periodsCountToShow = isMd ? 1 : 3;

  return (
    <div>
      {props.plan ? (
        <p>
          <strong>{translate('Current plan')}</strong>: {props.plan.name}
        </p>
      ) : (
        <p>{translate('Resource does not have any plan.')}</p>
      )}
      <table className="table table-row-bordered table-expandable align-middle">
        <thead>
          <tr>
            <th>{translate('Name')}</th>
            <th>{translate('Usage')}</th>
            <th>{translate('Current limit')}</th>
            <th>{translate('New limit')}</th>
            <th>{translate('Change')}</th>
            {props.shouldConcealPrices
              ? null
              : props.periods
                  .slice(0, periodsCountToShow)
                  .map((period, index) => (
                    <th className="col-sm-1" key={index}>
                      {period}
                      <PriceTooltip />
                    </th>
                  ))}
            {}
          </tr>
        </thead>
        <tbody>
          {props.components.map((component, index) => (
            <ComponentRow
              key={index}
              component={component}
              limits={props.offeringLimits[component.type]}
              shouldConcealPrices={props.shouldConcealPrices}
              periodsCountToShow={periodsCountToShow}
              periods={props.periods}
            />
          ))}
          {props.shouldConcealPrices ? null : (
            <ComponentTotalRow
              totalPeriods={props.totalPeriods}
              changedTotalPeriods={props.changedTotalPeriods}
              periodsCountToShow={periodsCountToShow}
              periods={props.periods}
            />
          )}
        </tbody>
      </table>
    </div>
  );
};
