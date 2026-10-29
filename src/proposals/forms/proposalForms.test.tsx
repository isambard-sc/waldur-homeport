import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalFormsRetrieve } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { renderHookWithProviders } from '@/test/harness';

import { useProposalForm } from './proposalForms';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));

describe('useProposalForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFeatureVisible).mockReturnValue(true);
  });

  it("is the proposal's form when its call has a flow", async () => {
    vi.mocked(proposalFormsRetrieve).mockResolvedValue({
      data: { proposal_uuid: 'p-1', flow_name: 'AIRR Gateway' },
    } as any);
    const { result } = renderHookWithProviders(() => useProposalForm('p-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({ flow_name: 'AIRR Gateway' });
  });

  it('is null for a proposal whose call has no flow', async () => {
    vi.mocked(proposalFormsRetrieve).mockRejectedValue({
      status: 400,
      response: { status: 400 },
      detail: 'This call does not use a form flow.',
    });
    const { result } = renderHookWithProviders(() => useProposalForm('p-1'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('is an error for anything else', async () => {
    vi.mocked(proposalFormsRetrieve).mockRejectedValue({
      status: 500,
      response: { status: 500 },
    });
    const { result } = renderHookWithProviders(() => useProposalForm('p-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('asks nothing while the site has form flows switched off', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    renderHookWithProviders(() => useProposalForm('p-1'));
    expect(proposalFormsRetrieve).not.toHaveBeenCalled();
  });
});
