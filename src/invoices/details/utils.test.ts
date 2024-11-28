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
    expect(grouped[0].name).toBe('Project One');
    expect(grouped[0].resources).toHaveLength(1);
    expect(grouped[0].resources[0].total).toBe(250);
    expect(grouped[0].resources[0].price).toBe(125);
  });

  it('sorts items by specified sortKey in ascending order', () => {
    const items = [
      {
        project_uuid: 'project-2',
        project_name: 'Project B',
        resource_uuid: 'resource-2',
        resource_name: 'Resource B',
        total: '50.00',
        price: '25.00',
        details: {},
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project A',
        resource_uuid: 'resource-1',
        resource_name: 'Resource A',
        total: '100.00',
        price: '50.00',
        details: {},
      },
    ];
    const grouped = groupInvoiceItems(items as any[], 'name');
    expect(grouped[0].name).toBe('Project A');
    expect(grouped[1].name).toBe('Project B');
  });

  it('sorts items by specified sortKey in descending order when desc is true', () => {
    const items = [
      {
        project_uuid: 'project-2',
        project_name: 'Project B',
        resource_uuid: 'resource-2',
        resource_name: 'Resource B',
        total: '50.00',
        price: '25.00',
        details: {},
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project A',
        resource_uuid: 'resource-1',
        resource_name: 'Resource A',
        total: '100.00',
        price: '50.00',
        details: {},
      },
    ];
    const grouped = groupInvoiceItems(items as any[], 'name', true);
    expect(grouped[0].name).toBe('Project B');
    expect(grouped[1].name).toBe('Project A');
  });

  it('groups items by resource_uuid if present, otherwise by details.resource_uuid', () => {
    const items = [
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-uuid-1',
        resource_name: 'Resource One',
        total: '100.00',
        price: '50.00',
        details: {
          resource_uuid: 'details-resource-uuid-1',
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

    // Expect one project group for "Project One"
    expect(grouped).toHaveLength(1);
    expect(grouped[0].name).toBe('Project One');

    // Verify resources are grouped by resource_uuid and details.resource_uuid
    expect(grouped[0].resources).toHaveLength(2);

    // First resource uses resource_uuid
    expect(grouped[0].resources[0].uuid).toBe('resource-uuid-1');
    expect(grouped[0].resources[0].name).toBe('Resource One');
    expect(grouped[0].resources[0].total).toBe(100);
    expect(grouped[0].resources[0].price).toBe(50);

    // Second resource uses details.resource_uuid
    expect(grouped[0].resources[1].uuid).toBe('details-resource-uuid-2');
    expect(grouped[0].resources[1].name).toBe('Resource Two');
    expect(grouped[0].resources[1].total).toBe(150);
    expect(grouped[0].resources[1].price).toBe(75);
  });
});
