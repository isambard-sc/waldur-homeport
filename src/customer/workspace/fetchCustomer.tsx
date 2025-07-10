import { Transition } from '@uirouter/react';
import { cloneDeep } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { customerCreditsList, Customer } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';
import { showErrorResponse } from '@waldur/store/notify';
import store from '@waldur/store/store';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer as getCustomerSelector } from '@waldur/workspace/selectors';

import { getCustomer } from '../utils';

const requiredFields: Array<keyof Customer> = [
  'uuid',
  'name',
  'abbreviation',
  'access_subnets',
  'accounting_start_date',
  'address',
  'agreement_number',
  'archived',
  'backend_id',
  'bank_account',
  'bank_name',
  'billing_price_estimate',
  'blocked',
  'call_managing_organization_uuid',
  'contact_details',
  'country',
  'country_name',
  'created',
  'customer_credit',
  'customer_unallocated_credit',
  'default_tax_percent',
  'display_name',
  'domain',
  'email',
  'homepage',
  'image',
  'is_service_provider',
  'latitude',
  'longitude',
  'max_service_accounts',
  'native_name',
  'organization_groups',
  'payment_profiles',
  'phone_number',
  'postal',
  'projects_count',
  'registration_code',
  'service_provider',
  'service_provider_uuid',
  'slug',
  'sponsor_number',
  'url',
  'users_count',
  'vat_code',
];

export async function fetchCustomer(transition: Transition) {
  const customerId = transition.params()?.uuid;
  if (!customerId) {
    router.stateService.go('errorPage.notFound');
  } else {
    try {
      const currentCustomer = await getCustomer(customerId, requiredFields);
      const credit = await customerCreditsList({
        query: { customer_uuid: currentCustomer?.uuid },
      }).then((r) => r.data[0]);
      Object.assign(currentCustomer, { credit });
      store.dispatch(setCurrentCustomer(currentCustomer));
    } catch {
      router.stateService.go('errorPage.notFound');
    }
  }
}

/** Get customer's project permissions for the selected customer separately */
export function useCustomerProjects() {
  const customer = useSelector(getCustomerSelector);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (customer.projects) return;

    setLoading(true);
    getCustomer(customer.uuid, ['projects'])
      .then(({ projects }) => {
        const updatedCustomer = cloneDeep(customer);
        Object.assign(updatedCustomer, { projects });
        store.dispatch(setCurrentCustomer(updatedCustomer));
      })
      .catch((err) => {
        store.dispatch(
          showErrorResponse(
            err,
            translate('Unable to load project permissions'),
          ),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customer]);

  return { loading };
}
