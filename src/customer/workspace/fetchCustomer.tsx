import { Transition } from '@uirouter/react';

import { getCustomer } from '@waldur/project/api';
import { router } from '@waldur/router';
import store from '@waldur/store/store';
import { setCurrentCustomer } from '@waldur/workspace/actions';

import { getCustomerCredit } from '../credits/api';

export async function fetchCustomer(transition: Transition) {
  const customerId = transition.params()?.uuid;
  if (!customerId) {
    router.stateService.go('errorPage.notFound');
  } else {
    try {
      const currentCustomer = await getCustomer(customerId);
      const credit = await getCustomerCredit(currentCustomer?.uuid);
      Object.assign(currentCustomer, { credit });
      store.dispatch(setCurrentCustomer(currentCustomer));
    } catch {
      router.stateService.go('errorPage.notFound');
    }
  }
}
