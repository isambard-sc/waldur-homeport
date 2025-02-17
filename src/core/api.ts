import Axios, {
  AxiosPromise,
  Method,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import { ENV } from '@waldur/configs/default';

export const fixURL = (endpoint: string) =>
  endpoint.startsWith('http') ? endpoint : `${ENV.apiEndpoint}api${endpoint}`;

export const parseResultCount = (response: AxiosResponse): number =>
  parseInt(response.headers['x-result-count'], 10);

export function get<T = {}>(
  endpoint: string,
  options?: AxiosRequestConfig,
): AxiosPromise<T> {
  return Axios.get(fixURL(endpoint), options);
}

export async function getList<T = {}>(
  endpoint: string,
  params?: {},
  options?: AxiosRequestConfig,
) {
  const response = await get<T>(endpoint, { ...options, params });
  return Array.isArray(response.data) ? (response.data as T[]) : [];
}

export function getSelectData<T = {}>(endpoint: string, params?: {}) {
  const options = params ? { params } : undefined;
  return get<T>(endpoint, options).then((response) => ({
    options: Array.isArray(response.data) ? (response.data as T[]) : [],
    totalItems: parseResultCount(response),
  }));
}

export async function getFirst<T = {}>(
  endpoint,
  params?,
  options?: AxiosRequestConfig,
) {
  const data = await getList<T>(endpoint, params, options);
  return data[0] ?? null;
}

export function getById<T = {}>(
  endpoint: string,
  id: string,
  options?: AxiosRequestConfig,
): Promise<T> {
  return get<T>(`${endpoint}${id}/`, options).then((response) => response.data);
}

export function remove<T = {}>(
  endpoint: string,
  options?: AxiosRequestConfig,
): AxiosPromise<T> {
  return Axios.delete(fixURL(endpoint), options);
}

export function deleteById<T = {}>(endpoint, id, options?: AxiosRequestConfig) {
  return remove<T>(`${endpoint}${id}/`, options).then(
    (response) => response.data,
  );
}

export function post<T = {}>(
  endpoint: string,
  data?: any,
  options?: AxiosRequestConfig,
): AxiosPromise<T> {
  return Axios.post(fixURL(endpoint), data, options);
}

export function patch<T = {}>(endpoint: string, data?: any): AxiosPromise<T> {
  return Axios.patch(fixURL(endpoint), data);
}

export function put<T = {}>(endpoint: string, data?: any): AxiosPromise<T> {
  return Axios.put(fixURL(endpoint), data);
}

export function sendForm<T = {}>(
  method: Method,
  url: string,
  options,
  onUploadProgress?: (progress: number) => void,
): AxiosPromise<T> {
  const data = new FormData();
  for (const name of Object.keys(options)) {
    if (options[name] !== undefined) {
      const option = options[name] === null ? '' : options[name];
      data.append(name, option);
    }
  }
  return Axios.request({
    method,
    url,
    data,
    transformRequest: (x) => x,
    headers: onUploadProgress
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': undefined },
    onUploadProgress: (progressEvent) => {
      if (!onUploadProgress) return;
      const progress = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1),
      );
      onUploadProgress(progress);
    },
  });
}

export const getNextPageUrl = (response) => {
  // Extract next page URL from header links
  const link = response.headers['link'];
  if (!link) {
    return null;
  }

  const nextLink = link
    .split(', ')
    .filter((s) => s.indexOf('rel="next"') > -1)[0];
  if (!nextLink) {
    return null;
  }

  return nextLink.split(';')[0].slice(1, -1);
};

export async function getAll<T = {}>(
  endpoint: string,
  options?: AxiosRequestConfig,
): Promise<T[]> {
  let response = await get(endpoint, options);
  let result = [];

  while (true) {
    if (Array.isArray(response.data)) {
      result = result.concat(response.data);
    }
    const url = getNextPageUrl(response);
    if (url) {
      response = await Axios.get(url, { signal: options?.signal });
    } else {
      break;
    }
  }
  return result;
}
