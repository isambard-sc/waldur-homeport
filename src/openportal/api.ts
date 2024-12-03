import { ENV } from '@waldur/configs/default';
import { post, put, sendForm } from '@waldur/core/api';

import { AllocationLimits } from './types';

export const setLimits = (id, data: AllocationLimits) =>
  post(`/openportal-allocations/${id}/set_limits/`, data);

export const updateAllocation = (id, data) =>
  put(`/openportal-allocations/${id}/`, data);

export const pullAllocation = (id: string) =>
  post(`/openportal-allocations/${id}/pull/`);

export const submitJob = (payload) =>
  sendForm('POST', `${ENV.apiEndpoint}api/openportal-jobs/`, payload);
