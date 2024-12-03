import { getAll } from '@waldur/core/api';

import { UserUsage } from './types';

export const getAllocationUserUsages = (params) =>
  getAll<UserUsage>('/openportal-allocation-user-usage/', { params });
