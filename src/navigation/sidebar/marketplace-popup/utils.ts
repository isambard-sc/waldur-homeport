import {
  getAllPublicOfferings,
  getCategories,
  getPublicOfferingsList,
} from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { Customer, Project } from '@waldur/workspace/types';

export const fetchCategories = async (
  customer: Customer,
  project: Project,
  offering_name = '',
) => {
  return await getCategories({
    params: {
      allowed_customer_uuid: customer.uuid,
      ...(project ? { project_uuid: project.uuid } : {}),
      field: ['uuid', 'title', 'offering_count', 'icon', 'group'],
      has_offerings: true,
      offering_name,
    },
  });
};

export const fetchOfferings = async (
  customer: Customer,
  project: Project,
  category: Category,
  search: string,
) => {
  const offerings = await getAllPublicOfferings({
    params: {
      allowed_customer_uuid: customer.uuid,
      ...(project ? { project_uuid: project.uuid } : {}),
      category_uuid: category.uuid,
      name: search,
      field: [
        'uuid',
        'category_uuid',
        'customer_uuid',
        'category_title',
        'name',
        'description',
        'image',
        'state',
        'paused_reason',
      ],
      state: ['Active', 'Paused'],
    },
  });
  return offerings;
};

export const fetchLastNOfferings = async (
  customer: Customer,
  project: Project,
  page_size = 5,
) => {
  const offerings = await getPublicOfferingsList({
    page: 1,
    page_size,
    allowed_customer_uuid: customer.uuid,
    ...(project ? { project_uuid: project.uuid } : {}),
    field: [
      'uuid',
      'category_uuid',
      'customer_uuid',
      'category_title',
      'name',
      'description',
      'image',
      'state',
      'paused_reason',
    ],
    state: ['Active', 'Paused'],
    o: '-created',
  });
  return offerings;
};
