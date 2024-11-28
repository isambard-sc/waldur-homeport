import { DateTime } from 'luxon';
import { describe, beforeEach, vi, afterEach, it, expect } from 'vitest';

import { makeAccountingPeriods } from './utils';

describe('makeAccountingPeriods', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it('iterates through months', () => {
    vi.setSystemTime(
      DateTime.fromObject({ year: 2021, month: 10, day: 1 }).toJSDate(),
    );
    const options = makeAccountingPeriods(
      DateTime.fromObject({ year: 2021, month: 1, day: 1 }),
    );
    expect(options).toMatchSnapshot();
  });
});
