import { createSelector } from 'reselect';

import { getCustomer } from '@waldur/workspace/selectors';
import { PaymentProfile } from '@waldur/workspace/types';

import { InvoiceItem, InvoiceTableItem } from '../types';

const getResourceKey = (item: InvoiceItem) =>
  item.resource_uuid || item.details?.scope_uuid || item.details.resource_uuid;

export const groupInvoiceItems = (items: InvoiceItem[]): InvoiceTableItem[] => {
  const groupedByProjectAndResource = items.reduce<
    Record<string, InvoiceTableItem>
  >((acc, item) => {
    const resourceKey = getResourceKey(item);
    const key = `${item.project_uuid}-${resourceKey}`;

    if (!acc[key]) {
      acc[key] = {
        resource_name:
          item.resource_name || item.details.resource_name || item.name,
        resource_uuid: resourceKey,
        project_name: item.project_name,
        project_uuid: item.project_uuid,
        service_provider_name: item.details.service_provider_name,
        service_provider_uuid: item.details.service_provider_uuid,
        plan_name: item.details.plan_name,
        price: 0,
        tax: 0,
        total: 0,
        items: [] as InvoiceItem[],
      };
    }

    acc[key].price += Number(item.price);
    acc[key].tax += Number(item.tax);
    acc[key].total += Number(item.total);

    acc[key].items.push(item);

    return acc;
  }, {});

  return Object.values(groupedByProjectAndResource);
};

// phone numbers specification https://www.itu.int/rec/T-REC-E.164-201011-I
export function formatPhone(value) {
  if (
    value === undefined ||
    value.national_number === undefined ||
    value.country_code === undefined
  ) {
    return value;
  }

  let nationalNumber = value.national_number || '';

  if (nationalNumber.length === 7) {
    nationalNumber = nationalNumber.replace(
      /(\d{3})(\d{2})(\d{2})/,
      '$1-$2-$3',
    );
  } else if (nationalNumber.length === 10) {
    nationalNumber = nationalNumber.replace(
      /(\d{3})(\d{3})(\d{4})/,
      '$1-$2-$3',
    );
  }

  return `(+${value.country_code})-${nationalNumber}`;
}

export const getActiveFixedPricePaymentProfile = (profiles: PaymentProfile[]) =>
  profiles?.find(
    (profile) => profile.is_active && profile.payment_type === 'fixed_price',
  );

export const getActivePaymentProfile = (profiles: PaymentProfile[]) =>
  profiles?.find((profile) => profile.is_active);

export const hasMonthlyPaymentProfile = createSelector(
  getCustomer,
  (customer) =>
    getActivePaymentProfile(customer.payment_profiles)?.payment_type ===
    'payment_gw_monthly',
);
