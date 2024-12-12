import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage } from './types';
import { getEChartOptions } from './utils';

describe('ResourceUsageChart', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should filter usages by component type', () => {
    const component: OfferingComponent = {
      type: 'ram',
      name: 'RAM',
      measured_unit: 'GB',
      billing_type: 'usage',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        type: 'ram',
        usage: 10,
        description: 'RAM usage',
        billing_period: '2024-03-01',
      },
      {
        type: 'cpu',
        usage: 4,
        description: 'CPU usage',
        billing_period: '2024-03-01',
      },
    ] as ComponentUsage[];

    const result = getEChartOptions(component, usages, [], 1, '#1f77b4');

    // Verify that only RAM usage is included
    expect(result.series[0].data).toHaveLength(1);
    expect(result.series[0].data[0].value).toBe(10);
    expect(result.series[0].data[0].description).toBe('RAM usage');
  });

  it('should filter usages by billing period', () => {
    const component: OfferingComponent = {
      type: 'ram',
      name: 'RAM',
      measured_unit: 'GB',
      billing_type: 'usage',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        type: 'ram',
        usage: 10,
        description: 'March usage',
        billing_period: '2024-03-01',
      },
      {
        type: 'ram',
        usage: 8,
        description: 'February usage',
        billing_period: '2024-02-01',
      },
      {
        type: 'ram',
        usage: 6,
        description: 'January usage',
        billing_period: '2024-01-01',
      },
    ] as ComponentUsage[];

    // Only show last 2 months
    const result = getEChartOptions(component, usages, [], 2, '#1f77b4');

    // Verify that only last 2 months of data are included
    expect(result.series[0].data).toHaveLength(2);
    expect(result.series[0].data[0].value).toBe(8);
    expect(result.series[0].data[0].description).toBe('February usage');
    expect(result.series[0].data[1].value).toBe(10);
    expect(result.series[0].data[1].description).toBe('March usage');
  });
});
