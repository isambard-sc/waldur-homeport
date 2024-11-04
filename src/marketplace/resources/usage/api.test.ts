import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getPeriodLabel } from './api';

describe('Marketplace usage API', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2018, 9, 16));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses start of current billing period if plan has been enabled in previous billing period', () => {
    const period = {
      start: '2018-08-01',
      end: null,
      plan_name: 'Basic',
    };
    expect(getPeriodLabel(period)).toBe('Basic (from 2018-10-01 00:00)');
  });

  it('uses start field if plan has been enabled in current billing period', () => {
    const period = {
      start: '2018-10-10',
      end: null,
      plan_name: 'Basic',
    };
    expect(getPeriodLabel(period)).toBe('Basic (from 2018-10-10 00:00)');
  });
});
