import { ENV } from '@waldur/configs/default';
import { deleteById, getAll, post, put, sendForm } from '@waldur/core/api';

import { Category, CategoryGroup } from '../../types';

export const removeCategory = (uuid: string) =>
  deleteById('/marketplace-categories/', uuid);

export const createCategory = (data) => {
  const formData = {
    title: data.title,
    description: data.description,
    icon: data.icon,
    group: data.group,
    default_vm_category: data.default_vm_category,
    default_volume_category: data.default_volume_category,
    default_tenant_category: data.default_tenant_category,
  };
  return sendForm<Category>(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-categories/`,
    formData,
  );
};

export const updateCategory = (data, uuid) => {
  const formData = {
    title: data.title,
    description: data.description,
    icon: data.icon,
    group: data.group?.url || null,
    default_vm_category: data.default_vm_category,
    default_volume_category: data.default_volume_category,
    default_tenant_category: data.default_tenant_category,
  };
  if (!formData.icon) {
    formData.icon = '';
  } else if (!(formData.icon instanceof File)) {
    formData.icon = undefined;
  }
  return sendForm<Category>(
    'PATCH',
    `${ENV.apiEndpoint}api/marketplace-categories/${uuid}/`,
    formData,
  );
};

export const removeCategoryGroup = (uuid: string) =>
  deleteById('/marketplace-category-groups/', uuid);

export const createCategoryGroup = (data) => {
  const formData = {
    title: data.title,
    description: data.description,
    icon: data.icon,
  };
  return sendForm<CategoryGroup>(
    'POST',
    `${ENV.apiEndpoint}api/marketplace-category-groups/`,
    formData,
  );
};

export const updateCategoryGroup = (data, uuid) => {
  const formData = {
    title: data.title,
    description: data.description,
    icon: data.icon,
  };
  if (!formData.icon) {
    formData.icon = '';
  } else if (!(formData.icon instanceof File)) {
    formData.icon = undefined;
  }
  return sendForm<CategoryGroup>(
    'PATCH',
    `${ENV.apiEndpoint}api/marketplace-category-groups/${uuid}/`,
    formData,
  );
};

export const getCategoryColumns = (params) =>
  getAll<any>(`/marketplace-category-columns/`, { params });

export const updateCategoryColumn = (uuid, data) =>
  put(`/marketplace-category-columns/${uuid}/`, data);

export const createCategoryColumn = (data) =>
  post(`/marketplace-category-columns/`, data);

export const deleteCategoryColumn = (uuid) =>
  deleteById('/marketplace-category-columns/', uuid);
