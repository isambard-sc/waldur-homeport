import { deleteById, patch, post, put } from '@waldur/core/api';

import { RemoteSyncForm } from './types';

export const removeRemoteSync = (uuid: string) =>
  deleteById('/marketplace-remote-synchronisations/', uuid);

export const createRemoteSync = (data: RemoteSyncForm) =>
  post('/marketplace-remote-synchronisations/', data);

export const updateRemoteSync = (data: RemoteSyncForm, uuid: string) =>
  put(`/marketplace-remote-synchronisations/${uuid}/`, data);

export const activateRemoteSync = (enabled: boolean, uuid: string) =>
  patch(`/marketplace-remote-synchronisations/${uuid}/`, {
    is_active: enabled,
  });

export const synchroniseRemoteSync = (uuid: string) =>
  post(`/marketplace-remote-synchronisations/${uuid}/run_synchronisation/`);

export const getRemoteCustomers = (remoteApi: string, remoteToken: string) =>
  post('/remote-waldur-api/remote_customers/', {
    api_url: remoteApi,
    token: remoteToken,
  }).then((res) => res.data);

export const getRemoteCategories = (remoteApi: string, remoteToken: string) => {
  return post('/remote-waldur-api/remote_categories/', {
    api_url: remoteApi,
    token: remoteToken,
  }).then((res) => res.data);
};
