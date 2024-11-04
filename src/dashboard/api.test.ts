import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from './api';

vi.mock('@waldur/core/formatCurrency', () => ({
  defaultCurrency: (val) => `EUR${val}`,
}));

describe('Dashboard chart API', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('appends missing items', () => {
    const pairs = [
      {
        date: '2018-09-01',
        value: 10,
      },
      {
        date: '2018-10-01',
        value: 20,
      },
    ];
    vi.setSystemTime(new Date(2018, 9, 1));
    const result = api.padMissingValues(pairs);
    expect(result.length).toBe(12);
    expect(result[0].value).toBe(0);
    expect(result[result.length - 3].date).toEqual(
      DateTime.fromISO('2018-08-01'),
    );
  });
});
