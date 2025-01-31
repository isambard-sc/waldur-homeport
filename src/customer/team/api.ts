import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import {
  fixURL,
  getSelectData,
  parseResultCount,
  post,
} from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

export const closeReview = (reviewId: string) =>
  post(`/customer-permissions-reviews/${reviewId}/close/`);

export const usersAutocomplete = async (
  query: object,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    field: [
      'full_name',
      'url',
      'email',
      'uuid',
      'username',
      'registration_method',
      'is_active',
    ],
    o: 'full_name',
    ...query,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getSelectData('/users/', params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const getCustomerUsersCount = (customerUuid) =>
  Axios.head(fixURL(`/customers/${customerUuid}/users/`)).then(
    parseResultCount,
  );
