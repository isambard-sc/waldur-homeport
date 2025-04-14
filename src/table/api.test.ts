import { describe, it, expect, vi } from 'vitest';

import { queryClient } from '@waldur/Application';
import { getNextPageNumber } from '@waldur/core/api';
import { createFetcher } from '@waldur/table/api';

describe('getNextPageNumber', () => {
  const link = '</api/users/?page=2&page_size=10>; rel="next"';
  it('should parse link from response and extract next page number', () => {
    expect(getNextPageNumber(link)).toEqual(2);
  });
});

describe.skip('createFetcher', () => {
  it('should merge options.params with request params and filter params', async () => {
    const fetchMock = vi.mocked(fetch).mockResolvedValue({
      data: [],
      headers: { get: vi.fn() },
    } as any);

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

    expect(fetchMock).toHaveBeenCalledWith(
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
