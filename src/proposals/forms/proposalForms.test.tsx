import { waitFor } from '@testing-library/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalFormsFetch, proposalFormsRetrieve } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { renderHookWithProviders } from '@/test/harness';

import { useFetchOnFormReturn, useProposalForm } from './proposalForms';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));

describe('useProposalForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFeatureVisible).mockReturnValue(true);
  });

  it("is the proposal's forms when its call has a flow", async () => {
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
      detail: 'This call does not use forms.',
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

  it('asks nothing while the site has forms switched off', () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    renderHookWithProviders(() => useProposalForm('p-1'));
    expect(proposalFormsRetrieve).not.toHaveBeenCalled();
  });
});

describe('useFetchOnFormReturn', () => {
  const withParams = (params: Record<string, string>) =>
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'proposals.manage-proposal' },
      params,
    } as any);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    vi.mocked(proposalFormsFetch).mockResolvedValue({
      data: { proposal_uuid: 'p-1', fetched: 1 },
    } as any);
  });

  it('fetches once on the way back from a survey and drops the parameter', async () => {
    withParams({ proposal_uuid: 'p-1', form_survey: 'svy1' });
    const { rerender } = renderHookWithProviders(() =>
      useFetchOnFormReturn('p-1'),
    );
    rerender();

    await waitFor(() =>
      expect(proposalFormsFetch).toHaveBeenCalledWith({
        path: { uuid: 'p-1' },
      }),
    );
    expect(proposalFormsFetch).toHaveBeenCalledTimes(1);
    expect(useRouter().stateService.go).toHaveBeenCalledWith(
      '.',
      { form_survey: null },
      { location: 'replace' },
    );
  });

  it('does nothing on an ordinary visit', () => {
    withParams({ proposal_uuid: 'p-1' });
    renderHookWithProviders(() => useFetchOnFormReturn('p-1'));
    expect(proposalFormsFetch).not.toHaveBeenCalled();
  });
});
