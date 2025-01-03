import Axios from 'axios';
import { describe, it, expect, vi } from 'vitest';

import { queryClient } from '@waldur/Application';
import { getNextPageNumber, createFetcher } from '@waldur/table/api';

describe('getNextPageNumber', () => {
  const link = '</api/users/?page=2&page_size=10>; rel="next"';
  it('should parse link from response and extract next page number', () => {
    expect(getNextPageNumber(link)).toEqual(2);
  });
});

describe('createFetcher', () => {
  it('should merge options.params with request params and filter params', async () => {
    const axiosMock = vi.spyOn(Axios, 'request').mockResolvedValue({
      data: [],
      headers: {},
    });

    vi.spyOn(queryClient, 'fetchQuery');

    const fetcher = createFetcher('endpoint', {
      params: {
        field1: 'value1',
        field2: 'value2',
      },
    });

    await fetcher({
      currentPage: 1,
      pageSize: 10,
      filter: { status: 'active' },
    });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {
          page: 1,
          page_size: 10,
          status: 'active',
          field1: 'value1',
          field2: 'value2',
        },
      }),
    );
  });
});
