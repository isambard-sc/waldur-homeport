import { describe, it, expect } from 'vitest';

import { groupInvoiceItems } from './utils';

describe('groupInvoiceItems', () => {
  it('groups items by project_uuid and resource_uuid', () => {
    const items = [
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-1',
        resource_name: 'Resource One',
        total: '100.00',
        price: '50.00',
        details: {
          service_provider_name: 'Provider A',
          offering_name: 'Offering A',
          plan_name: 'Plan A',
        },
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-1',
        resource_name: 'Resource One',
        total: '150.00',
        price: '75.00',
        details: {
          service_provider_name: 'Provider A',
          offering_name: 'Offering A',
          plan_name: 'Plan A',
        },
      },
    ];
    const grouped = groupInvoiceItems(items as any[]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].project_name).toBe('Project One');
    expect(grouped[0].total).toBe(250);
    expect(grouped[0].items).toHaveLength(2);
    expect(Number(grouped[0].items[0].total)).toBe(100);
    expect(Number(grouped[0].items[0].price)).toBe(50);
    expect(Number(grouped[0].items[1].total)).toBe(150);
    expect(Number(grouped[0].items[1].price)).toBe(75);
  });

  it('groups items by resource_uuid if present, otherwise by details.resource_uuid', () => {
    const items = [
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-uuid-1',
        resource_name: 'Resource One',
        total: '50.00',
        price: '40.00',
        details: {
          offering_component_name: 'Storage',
          resource_uuid: 'resource-uuid-1',
          service_provider_name: 'Provider A',
          offering_name: 'Offering A',
          plan_name: 'Plan A',
        },
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_name: 'Resource One',
        total: '100.00',
        price: '50.00',
        details: {
          offering_component_name: 'CPU',
          resource_uuid: 'resource-uuid-1',
          service_provider_name: 'Provider A',
          offering_name: 'Offering A',
          plan_name: 'Plan A',
        },
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        details: {
          resource_uuid: 'details-resource-uuid-2',
          service_provider_name: 'Provider B',
          offering_name: 'Offering B',
          plan_name: 'Plan B',
        },
        total: '150.00',
        price: '75.00',
        name: 'Resource Two',
      },
    ];

    const grouped = groupInvoiceItems(items as any[]);

    // Expect two project-resource group
    expect(grouped).toHaveLength(2);
    expect(grouped[0].project_name).toBe('Project One');
    expect(grouped[1].project_name).toBe('Project One');

    // Verify resources are grouped by resource_uuid and details.resource_uuid
    expect(grouped[0].items).toHaveLength(2);
    expect(grouped[0].total).toBe(150);

    // First group - First resource uses resource_uuid
    expect(grouped[0].resource_uuid).toBe('resource-uuid-1');
    expect(grouped[0].resource_name).toBe('Resource One');
    expect(Number(grouped[0].items[0].total)).toBe(50);
    expect(Number(grouped[0].items[0].price)).toBe(40);

    // First group - Second resource uses details.resource_uuid
    expect(Number(grouped[0].items[1].total)).toBe(100);
    expect(Number(grouped[0].items[1].price)).toBe(50);

    // Second group - resource uses details.resource_uuid
    expect(grouped[1].resource_uuid).toBe('details-resource-uuid-2');
    expect(grouped[1].resource_name).toBe('Resource Two');
    expect(Number(grouped[1].items[0].total)).toBe(150);
    expect(Number(grouped[1].items[0].price)).toBe(75);
  });
});
