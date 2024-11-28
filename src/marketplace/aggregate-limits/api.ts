import { get, getAll } from '@waldur/core/api';
import { Resource } from '@waldur/resource/types';

import { AggregateLimitStatsResponse } from './types';

export const getProjectStats = (projectUUID: string) =>
  get<AggregateLimitStatsResponse>(`/projects/${projectUUID}/stats/`);

export const getCustomerStats = (customerUUID: string) =>
  get<AggregateLimitStatsResponse>(`/customers/${customerUUID}/stats/`);

export const getMarketplaceResources = (params) =>
  getAll<Resource[]>(`/marketplace-resources/`, { params });
