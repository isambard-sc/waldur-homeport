import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  marketplaceProviderOfferingsRetrieve,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProposalsResourceAdjustmentsPartialUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AdjustmentFormDialog } from './AdjustmentFormDialog';

const proposal = { uuid: 'proposal-uuid' } as any;

beforeEach(() => {
  vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
    data: {
      resource_options: {
        order: ['cpu'],
        options: { cpu: { label: 'CPU cores', type: 'integer', min: 1 } },
      },
    },
  } as any);
});

describe('AdjustmentFormDialog - new adjustment', () => {
  const allocationItem = {
    requested_resource_uuid: 'resource-uuid',
    offering_uuid: 'offering-uuid',
    offering_name: 'GPU cluster',
    original_attributes: { cpu: 2 },
    effective_attributes: { cpu: 2 },
    adjustment: null,
  } as any;

  it('creates a modify adjustment referencing the requested resource', async () => {
    const user = userEvent.setup();
    vi.mocked(proposalProposalsResourceAdjustmentsCreate).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <AdjustmentFormDialog
        resolve={{ proposal, allocationItem, refetch: vi.fn() }}
      />,
    );

    // Number inputs don't support text selection, so {selectall} can't be
    // used here - set the value directly instead.
    const cpuInput = await screen.findByDisplayValue('2');
    fireEvent.change(cpuInput, { target: { value: '8' } }); // eslint-disable-line testing-library/prefer-user-event
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(proposalProposalsResourceAdjustmentsCreate).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        body: {
          requested_resource: 'resource-uuid',
          action: 'modify',
          adjusted_attributes: { cpu: 8 },
        },
      });
    });
  });

  it('shows the original value alongside the editable field', async () => {
    renderWithProviders(
      <AdjustmentFormDialog
        resolve={{ proposal, allocationItem, refetch: vi.fn() }}
      />,
    );
    expect(await screen.findByText(/Original: 2/)).toBeInTheDocument();
  });
});

describe('AdjustmentFormDialog - existing adjustment', () => {
  const allocationItem = {
    requested_resource_uuid: 'resource-uuid',
    offering_uuid: 'offering-uuid',
    offering_name: 'GPU cluster',
    original_attributes: { cpu: 2 },
    effective_attributes: { cpu: 8 },
    adjustment: { uuid: 'adjustment-uuid' },
  } as any;

  it('patches the existing adjustment instead of creating a new one', async () => {
    const user = userEvent.setup();
    vi.mocked(
      proposalProposalsResourceAdjustmentsPartialUpdate,
    ).mockResolvedValue({ data: {} } as any);
    renderWithProviders(
      <AdjustmentFormDialog
        resolve={{ proposal, allocationItem, refetch: vi.fn() }}
      />,
    );

    const cpuInput = await screen.findByDisplayValue('8');
    fireEvent.change(cpuInput, { target: { value: '16' } }); // eslint-disable-line testing-library/prefer-user-event
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(
        proposalProposalsResourceAdjustmentsPartialUpdate,
      ).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid', obj_uuid: 'adjustment-uuid' },
        body: { adjusted_attributes: { cpu: 16 } },
      });
    });
  });
});
