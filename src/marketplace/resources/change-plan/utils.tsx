import {
  BasePublicPlan,
  marketplacePublicOfferingsRetrieve,
  marketplaceResourcesRetrieve,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import {
  SelectDialogFieldColumn,
  SelectDialogFieldChoice,
} from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { filterOfferingComponents } from '@waldur/marketplace/common/registry';

export interface FetchedData {
  resource: Resource;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  initialValues: {
    plan: SelectDialogFieldChoice;
  };
}

const getColumns = (
  offering: PublicOfferingDetails,
): SelectDialogFieldColumn[] => [
  {
    name: 'name',
    label: translate('Name'),
  },
  ...filterOfferingComponents(offering)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((component) => ({
      name: component.type,
      label: component.name,
    })),
  {
    name: 'price',
    label: translate('Price'),
  },
];

const sortPlans = (plans: BasePublicPlan[]) =>
  plans
    .map((plan) => ({
      ...plan,
      unit_price:
        typeof plan.unit_price === 'string'
          ? parseFloat(plan.unit_price)
          : plan.unit_price,
    }))
    .sort((a, b) => a.unit_price - b.unit_price);

const getPlanSwitchPrice = (plan: BasePublicPlan) => {
  const fixedPart =
    typeof plan.unit_price === 'string'
      ? parseFloat(plan.unit_price)
      : plan.unit_price;
  const switchPart =
    typeof plan.switch_price === 'string'
      ? parseFloat(plan.switch_price)
      : plan.switch_price;
  return defaultCurrency(fixedPart + switchPart);
};

const getChoices = (
  offering: PublicOfferingDetails,
  resource: Resource,
): SelectDialogFieldChoice[] =>
  sortPlans(offering.plans).map((plan) => ({
    url: plan.url,
    uuid: plan.uuid,
    name: plan.name,
    ...plan.quotas,
    archived: plan.archived,
    // @ts-ignore
    price: getPlanSwitchPrice(plan),
    disabled: plan.url === resource.plan || !plan.is_active,
    disabledReason: !plan.is_active
      ? translate('Plan capacity is full.')
      : plan.url === resource.plan
        ? translate('Resource already has this plan.')
        : undefined,
  }));

export async function loadData(resource_uuid): Promise<FetchedData> {
  const resource = await marketplaceResourcesRetrieve({
    path: { uuid: resource_uuid },
  }).then((r) => r.data);
  const offering = await marketplacePublicOfferingsRetrieve({
    path: { uuid: resource.offering_uuid },
  }).then((response) => response.data);
  const columns = getColumns(offering);
  const choices = getChoices(offering, resource);
  const validPlan = choices.find((choice) => !choice.disabled);
  const initialValues = validPlan ? { plan: validPlan } : undefined;
  return { resource, columns, choices, initialValues };
}
