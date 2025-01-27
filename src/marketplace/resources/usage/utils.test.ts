import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage, ComponentUserUsage } from './types';
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

  it('should generate tooltip with user usage details', () => {
    const component: OfferingComponent = {
      type: 'cpu',
      name: 'CPU',
      measured_unit: 'cores',
      billing_type: 'usage',
    } as OfferingComponent;

    const usages: ComponentUsage[] = [
      {
        uuid: 'usage-1',
        type: 'cpu',
        name: 'CPU Usage',
        measured_unit: 'cores',
        usage: 16,
        description: 'Total CPU cores used',
        billing_period: '2024-03-01',
        date: '2024-03-01',
        recurring: false,
      } as ComponentUsage,
    ];

    const userUsages: ComponentUserUsage[] = [
      {
        uuid: 'user-1',
        component_type: 'cpu',
        component_usage: 'usage-1',
        username: 'Alice',
        user: 'user-1-uuid',
        usage: 10,
        measured_unit: 'cores',
        description: 'Alice CPU usage',
        date: '2024-03-01',
        billing_period: '2024-03-01',
        plan_period: '2024-03',
        is_visible: true,
        recurring: false,
        created: '2024-03-01',
        modified: '2024-03-01',
        scope: null,
        backend_id: 'backend-1',
        resource_name: 'Resource 1',
        resource_uuid: 'resource-1',
        offering_name: 'CPU Offering',
        offering_uuid: 'offering-1',
        customer_name: 'Customer 1',
        customer_uuid: 'customer-1',
        project_name: 'Project 1',
        project_uuid: 'project-1',
      } as ComponentUserUsage,
      {
        uuid: 'user-2',
        component_type: 'cpu',
        component_usage: 'usage-1',
        username: 'Bob',
        user: 'user-2-uuid',
        usage: 6,
        measured_unit: 'cores',
        description: 'Bob CPU usage',
        date: '2024-03-01',
        billing_period: '2024-03-01',
        plan_period: '2024-03',
        is_visible: true,
        recurring: false,
        created: '2024-03-01',
        modified: '2024-03-01',
        scope: null,
        backend_id: 'backend-2',
        resource_name: 'Resource 1',
        resource_uuid: 'resource-1',
        offering_name: 'CPU Offering',
        offering_uuid: 'offering-1',
        customer_name: 'Customer 1',
        customer_uuid: 'customer-1',
        project_name: 'Project 1',
        project_uuid: 'project-1',
      } as ComponentUserUsage,
    ];

    const result = getEChartOptions(
      component,
      usages,
      userUsages,
      1,
      '#1f77b4',
    );
    const tooltipFormatter = result.tooltip.formatter;
    const tooltipParams = [
      {
        axisValue: '3 - 2024',
        data: result.series[0].data[0],
      },
    ];

    const tooltipContent = tooltipFormatter(tooltipParams);

    expect(tooltipContent).toContain('Value: 16');
    expect(tooltipContent).toContain('Description: Total CPU cores used');

    expect(tooltipContent).toContain('Details:');
    expect(tooltipContent).toContain('Alice - 10 cores');
    expect(tooltipContent).toContain('Bob - 6 cores');

    expect(tooltipContent).toContain('Date: 3 - 2024');

    expect(result.series[0].data[0]).toEqual({
      value: 16,
      description: 'Total CPU cores used',
      details: expect.arrayContaining([
        expect.objectContaining({
          username: 'Alice',
          usage: 10,
          measured_unit: 'cores',
        }),
        expect.objectContaining({
          username: 'Bob',
          usage: 6,
          measured_unit: 'cores',
        }),
      ]),
    });
  });
});
