import {
  getPublicOffering,
  getResource,
  getPublicPlan,
} from '@waldur/marketplace/common/api';
import {
  getFormLimitSerializer,
  getFormLimitParser,
  filterOfferingComponents,
} from '@waldur/marketplace/common/registry';
import { LimitParser, Limits } from '@waldur/marketplace/common/types';
import { getBillingPeriods } from '@waldur/marketplace/common/utils';
import { parseOfferingLimits } from '@waldur/marketplace/offerings/store/limits';
import { OfferingLimits } from '@waldur/marketplace/offerings/store/types';
import { StateProps } from '@waldur/marketplace/resources/change-limits/connector';
import { Offering, Plan } from '@waldur/marketplace/types';

import { Resource } from '../types';

export interface FetchedData {
  resource: Resource;
  offering: Offering;
  plan: Plan;
  limitSerializer: LimitParser;
  usages: Limits;
  limits: Limits;
  initialValues: { limits: Limits };
  offeringLimits: OfferingLimits;
}

export async function loadData(resource_uuid): Promise<FetchedData> {
  const resource = await getResource(resource_uuid);
  const offering = await getPublicOffering(resource.offering_uuid);
  const plan = await getPublicPlan(resource.plan_uuid, resource.offering_uuid);
  const limitParser = getFormLimitParser(offering.type);
  const limitSerializer = getFormLimitSerializer(offering.type);
  const components = filterOfferingComponents(offering).filter(
    (component) => component.billing_type === 'limit',
  );
  const usages = limitParser(resource.current_usages);
  const resourceLimits = limitParser(resource.limits);
  const limits: Record<string, number> = components.reduce(
    (result, component) => ({
      ...result,
      [component.type]: resourceLimits[component.type],
    }),
    {},
  );
  const offeringLimits = parseOfferingLimits(offering);
  return {
    resource,
    offering,
    plan,
    limitSerializer,
    usages,
    limits,
    offeringLimits,
    initialValues: { limits },
  };
}

export const getData = (
  plan,
  offering,
  newLimits,
  currentLimits,
  usages,
  orderCanBeApproved,
): StateProps => {
  const { periods, multipliers } = getBillingPeriods(plan.unit);
  const offeringComponents = filterOfferingComponents(offering).filter(
    (component) => component.billing_type === 'limit',
  );
  const components = offeringComponents.map((component) => {
    const price = plan.prices[component.type] || 0;
    const subTotal = price * newLimits[component.type] || 0;
    const prices = multipliers.map((mult) => mult * subTotal);
    const currentLimit = currentLimits[component.type] || 0;
    const newLimit = newLimits[component.type] || 0;
    const changedLimit = newLimit - currentLimit;
    const changedSubTotal = price * changedLimit;
    const changedPrices = multipliers.map((mult) => mult * changedSubTotal);
    return {
      type: component.type,
      name: component.name,
      measured_unit: component.measured_unit,
      is_boolean: component.is_boolean,
      usage: usages[component.type] || 0,
      limit: currentLimits[component.type],
      prices,
      changedPrices,
      subTotal,
      changedSubTotal,
      changedLimit,
    };
  });
  const total = components.reduce((result, item) => result + item.subTotal, 0);
  const changedTotal = components.reduce(
    (result, item) => result + item.changedSubTotal,
    0,
  );
  const totalPeriods = multipliers.map((mult) => mult * total || 0);
  const changedTotalPeriods = multipliers.map(
    (mult) => mult * changedTotal || 0,
  );
  return {
    periods,
    components,
    orderCanBeApproved,
    totalPeriods,
    changedTotalPeriods,
  };
};
