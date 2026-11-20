import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalReviewsReturnToReviewer } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ReviewReturnAction } from './ReviewReturnAction';

const review = (state: string) => ({
  uuid: 'rev-1',
  state,
  proposal_name: 'Fusion modelling',
  reviewer_full_name: 'Ada Reviewer',
  call_uuid: 'call-1',
  call_managing_organisation_uuid: 'org-1',
});

describe('ReviewReturnAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
  });

  it('returns a submitted review with what to change', async () => {
    vi.mocked(useModal().confirm).mockResolvedValueOnce({
      input: '  Please score section 2.  ',
    } as any);
    vi.mocked(proposalReviewsReturnToReviewer).mockResolvedValue({
      data: {},
    } as any);
    const refetch = vi.fn();
    renderWithProviders(
      inActionsMenu(
        <ReviewReturnAction row={review('submitted')} refetch={refetch} />,
      ),
    );
    await userEvent.click(
      screen.getByRole('menuitem', { name: /Return to reviewer/ }),
    );

    expect(useModal().confirm).toHaveBeenCalledWith(
      'Return to reviewer',
      expect.anything(),
      expect.objectContaining({ inputRequired: true, inputMultiline: true }),
    );
    await waitFor(() =>
      expect(proposalReviewsReturnToReviewer).toHaveBeenCalledWith({
        path: { uuid: 'rev-1' },
        body: { reason: 'Please score section 2.' },
      }),
    );
  });

  it('is not offered on a review not yet submitted', () => {
    renderWithProviders(
      inActionsMenu(<ReviewReturnAction row={review('in_review')} />),
    );
    expect(
      screen.queryByRole('menuitem', { name: /Return to reviewer/ }),
    ).not.toBeInTheDocument();
  });

  it('is not offered to someone who may not decide proposals', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [],
    } as any);
    renderWithProviders(
      inActionsMenu(<ReviewReturnAction row={review('submitted')} />),
    );
    expect(
      screen.queryByRole('menuitem', { name: /Return to reviewer/ }),
    ).not.toBeInTheDocument();
  });
});
