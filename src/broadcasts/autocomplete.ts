import {
  broadcastMessageTemplatesList,
  proposalProtectedCallsList,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';

export const templateAutocomplete = async (
  query: string,
  prevOptions,
  page,
) => {
  const response = await broadcastMessageTemplatesList({
    query: {
      name: query,
      page: page,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const callAutocomplete = async (query: string, prevOptions, page) => {
  const response = await proposalProtectedCallsList({
    query: {
      name: query,
      field: ['name', 'uuid'],
      o: ['name'],
      page: page,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    page,
  );
};

export const roundAutocomplete = async (
  callUuid: string,
  query: string,
  prevOptions,
  page,
) => {
  const response = await proposalProtectedCallsRoundsList({
    path: { uuid: callUuid },
    query: {
      page: page,
      page_size: ENV.pageSize,
    },
  });
  // Filter by name on the client side since API doesn't support it
  const data = parseSelectData(response);
  if (query) {
    data.options = data.options.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
  }
  return returnReactSelectAsyncPaginateObject(data, prevOptions, page);
};
