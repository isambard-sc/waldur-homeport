import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  marketplaceProviderOfferingsRetrieve,
  proposalProposalsResourceAdjustmentsCreate,
  proposalProtectedCallsOfferingsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AddResourceAdjustmentDialog } from './AddResourceAdjustmentDialog';

const proposal = {
  uuid: 'proposal-uuid',
  call_uuid: 'call-uuid',
  name: 'Test',
} as any;

describe('AddResourceAdjustmentDialog', () => {
  beforeEach(() => {
    vi.mocked(proposalProtectedCallsOfferingsList).mockResolvedValue({
      data: [
        {
          uuid: 'offering-uuid',
          offering_uuid: 'real-offering-uuid',
          offering_name: 'GPU cluster',
          provider_name: 'Provider',
        },
      ],
    } as any);
    vi.mocked(marketplaceProviderOfferingsRetrieve).mockResolvedValue({
      data: {
        resource_options: {
          order: ['cpu'],
          options: { cpu: { label: 'CPU cores', type: 'integer', min: 1 } },
        },
      },
    } as any);
  });

  it('fetches only accepted call offerings', async () => {
    renderWithProviders(
      <AddResourceAdjustmentDialog resolve={{ proposal, refetch: vi.fn() }} />,
    );
    await waitFor(() =>
      expect(proposalProtectedCallsOfferingsList).toHaveBeenCalledWith({
        path: { uuid: 'call-uuid' },
        query: { state: 'accepted' },
      }),
    );
  });

  it('submits an add adjustment with the selected offering and attributes', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(proposalProposalsResourceAdjustmentsCreate).mockResolvedValue({
      data: {},
    } as any);
    renderWithProviders(
      <AddResourceAdjustmentDialog resolve={{ proposal, refetch }} />,
    );

    await screen.findByText('GPU cluster (Provider)');
    await user.selectOptions(
      screen.getByLabelText('Select offering'),
      'offering-uuid',
    );
    const cpuInput = await screen.findByLabelText(/CPU cores/);
    await user.clear(cpuInput);
    await user.type(cpuInput, '4');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(proposalProposalsResourceAdjustmentsCreate).toHaveBeenCalledWith({
        path: { uuid: 'proposal-uuid' },
        body: {
          call_offering: 'offering-uuid',
          action: 'add',
          adjusted_attributes: { cpu: 4 },
        },
      });
    });
  });

  it('disables Add until an offering is selected', () => {
    renderWithProviders(
      <AddResourceAdjustmentDialog resolve={{ proposal, refetch: vi.fn() }} />,
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });
});
