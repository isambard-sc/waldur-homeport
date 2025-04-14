import { broadcastMessageTemplatesList } from 'waldur-js-client';

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
