import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { fixURL, getSelectData, parseResultCount } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { User } from '@waldur/workspace/types';

export const customerUsersAutocomplete = async (
  customerUuid: string,
  query: object,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    o: 'concatenated_name',
    ...query,
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getSelectData<User[]>(
    `/customers/${customerUuid}/users/`,
    params,
  );
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const getProjectUsersCount = (projectUuid) =>
  Axios.head(fixURL(`/projects/${projectUuid}/list_users/`)).then(
    parseResultCount,
  );
