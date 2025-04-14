import { usersList, UsersListData } from 'waldur-js-client';

import { count, parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

export const usersAutocomplete = async (
  query: UsersListData['query'],
  prevOptions,
  currentPage: number,
) => {
  const response = await usersList({
    query: {
      field: [
        'full_name',
        'url',
        'email',
        'uuid',
        'username',
        'registration_method',
        'is_active',
      ],
      o: ['full_name'],
      ...query,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const getCustomerUsersCount = (customerUuid: string) =>
  count(`/api/customers/${customerUuid}/users/`);
