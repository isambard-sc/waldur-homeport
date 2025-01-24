import { deleteById, post, put } from '@waldur/core/api';

export const removeOrganizationGroup = (uuid: string) =>
  deleteById('/organization-groups/', uuid);

export const createOrganizationGroup = (data) =>
  post('/organization-groups/', data);

export const updateOrganizationGroup = (uuid, data) =>
  put(`/organization-groups/${uuid}/`, data);
