import Axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import Qs from 'qs';

import { queryClient } from '@waldur/Application';
import { ENV } from '@waldur/configs/default';
import { getNextPageUrl, parseResultCount } from '@waldur/core/api';

import { Fetcher, TableRequest } from './types';

export function getNextPageNumber(link: string): number {
  if (link) {
    const parts = Qs.parse(link.split('/?')[1]);
    if (parts && typeof parts.page === 'string') {
      return parseInt(parts.page, 10);
    }
  } else {
    return null;
  }
}

export const parseResponse = (url, params, options?: AxiosRequestConfig) =>
  Axios.request({
    method: 'GET',
    url,
    params,
    ...options,
  }).then((response: AxiosResponse<any>) => {
    const resultCount = parseResultCount(response);
    return {
      rows: Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.proposals)
          ? response.data.proposals
          : [],
      resultCount,
      nextPage: getNextPageNumber(getNextPageUrl(response)),
    };
  });

export function createFetcher(
  endpoint: string,
  options?: AxiosRequestConfig,
): Fetcher {
  return (request: TableRequest) => {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${ENV.apiEndpoint}api/${endpoint}/`;
    const params = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
    };
    return queryClient.fetchQuery({
      queryKey: ['table', url, params],
      queryFn: () =>
        parseResponse(url, params, { ...options, ...request.options }),
      staleTime: request.options?.staleTime,
    });
  };
}

export async function fetchAll(fetch: Fetcher, request: TableRequest) {
  let response = await fetch(request);
  let result = [];

  while (true) {
    result = result.concat(response.rows);
    if (response.nextPage) {
      request.currentPage = response.nextPage;
      response = await fetch(request);
    } else {
      break;
    }
  }
  return result;
}

export const ANONYMOUS_CONFIG = {
  transformRequest: [
    (data, headers) => {
      delete headers.Authorization;
      return data;
    },
  ],
};
