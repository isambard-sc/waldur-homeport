import {
  marketplaceChecklistsCategoriesChecklistsList,
  marketplaceChecklistsCategoriesList,
  marketplaceChecklistsList,
} from 'waldur-js-client';

import { count, getAllPages } from '@waldur/core/api';

export const getCategories = () =>
  getAllPages((page) =>
    marketplaceChecklistsCategoriesList({ query: { page } }),
  );

export const getChecklists = (category_uuid?: string) =>
  getAllPages((page) =>
    category_uuid
      ? marketplaceChecklistsCategoriesChecklistsList({
          path: { category_uuid },
          query: { page },
        })
      : marketplaceChecklistsList({ query: { page } }),
  );

export const countChecklists = () => count('/api/marketplace-checklists/');
