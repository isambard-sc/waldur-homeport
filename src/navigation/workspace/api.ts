import { get } from '@waldur/core/api';

export const getGlobalCounters = (params = {}) =>
  get(`/marketplace-global-categories/`, { params }).then(
    (response) => response.data,
  );
