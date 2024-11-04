import { describe, it, expect } from 'vitest';

import { getNextPageNumber } from '@waldur/table/api';

describe('getNextPageNumber', () => {
  const link = '</api/users/?page=2&page_size=10>; rel="next"';
  it('should parse link from response and extract next page number', () => {
    expect(getNextPageNumber(link)).toEqual(2);
  });
});
