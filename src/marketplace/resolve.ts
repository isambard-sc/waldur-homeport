import { Transition } from '@uirouter/react';

import { getServiceProviderByCustomer } from './common/api';

export const fetchProvider = (transition: Transition) =>
  getServiceProviderByCustomer({
    customer_uuid: transition.params().uuid,
  });
