import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';

import { formatCostChart } from '@waldur/dashboard/api';

vi.mock('@waldur/configs/default', () => ({
  ENV: {
    plugins: { WALDUR_CORE: { CURRENCY_NAME: 'EUR' } },
  },
}));

describe('Customer dashboard chart API', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats cost chart', () => {
    const invoices = [
      {
        year: 2018,
        month: 10,
        price: 300,
      },
      {
        year: 2018,
        month: 9,
        price: 200,
      },
      {
        year: 2018,
        month: 8,
        price: 100,
      },
    ];
    vi.setSystemTime(new Date(2018, 9, 16));
    const chart = formatCostChart(invoices);

    expect(chart.current).toEqual('EUR 300.00');
    expect(chart.data.length).toEqual(12);
    expect(chart.data[chart.data.length - 1].label).toEqual(
      'EUR 300.00 at 2018-10-31, estimated',
    );
    expect(chart.data[chart.data.length - 2].label).toEqual(
      'EUR 200.00 at 2018-09-01',
    );
    expect(chart.data[chart.data.length - 4].label).toEqual(
      'EUR 0.00 at 2018-07-01',
    );
  });
});
