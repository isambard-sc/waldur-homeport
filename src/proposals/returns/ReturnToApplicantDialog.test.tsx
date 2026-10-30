import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsExtendReturn,
  proposalProposalsReturnToApplicant,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ExtendReturnDialog } from './ExtendReturnDialog';
import {
  defaultResubmitBy,
  ReturnToApplicantDialog,
  validateResubmitBy,
} from './ReturnToApplicantDialog';

const proposal = { uuid: 'p-1', name: 'Fusion modelling' };

describe('validateResubmitBy', () => {
  it('wants a deadline in the future', () => {
    expect(validateResubmitBy(null)).toBe('This field is required.');
    expect(validateResubmitBy('2000-01-01T00:00:00Z')).toBe(
      'The deadline must be in the future.',
    );
    expect(validateResubmitBy(defaultResubmitBy())).toBeUndefined();
  });

  it('suggests two weeks ahead', () => {
    const days =
      (new Date(defaultResubmitBy()).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(13);
    expect(days).toBeLessThan(15);
  });
});

describe('ReturnToApplicantDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalProposalsReturnToApplicant).mockResolvedValue({
      data: {},
    } as any);
  });

  it('says what returning does', () => {
    renderWithProviders(<ReturnToApplicantDialog resolve={{ proposal }} />);
    expect(
      screen.getByText(/Its open reviews are cancelled/),
    ).toBeInTheDocument();
  });

  it('needs a reason', () => {
    renderWithProviders(<ReturnToApplicantDialog resolve={{ proposal }} />);
    expect(
      screen.getByRole('button', { name: 'Return to applicant' }),
    ).toBeDisabled();
  });

  it('returns the proposal with the reason and the deadline', async () => {
    const refetch = vi.fn();
    renderWithProviders(
      <ReturnToApplicantDialog resolve={{ proposal, refetch }} />,
    );
    await userEvent.type(
      screen.getByLabelText(/^Reason/),
      '  Please add a data management plan.  ',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Return to applicant' }),
    );

    await waitFor(() =>
      expect(proposalProposalsReturnToApplicant).toHaveBeenCalledWith({
        path: { uuid: 'p-1' },
        body: {
          reason: 'Please add a data management plan.',
          resubmit_by: expect.stringMatching(/^\d{4}-\d\d-\d\dT.*Z$/),
        },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });
});

describe('ExtendReturnDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts from the deadline still ahead and moves it', async () => {
    vi.mocked(proposalProposalsExtendReturn).mockResolvedValue({
      data: {},
    } as any);
    const resubmitBy = new Date(Date.now() + 3 * 86_400_000).toISOString();
    renderWithProviders(
      <ExtendReturnDialog resolve={{ proposal, resubmitBy }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Extend' }));

    await waitFor(() =>
      expect(proposalProposalsExtendReturn).toHaveBeenCalledWith({
        path: { uuid: 'p-1' },
        body: { resubmit_by: new Date(resubmitBy).toISOString() },
      }),
    );
  });
});
