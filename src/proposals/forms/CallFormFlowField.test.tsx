import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formFlowsList, proposalFormCallsRetrieve } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { renderWithProviders } from '@/test/harness';

import { CallFormFlowField, validateOpenDays } from './CallFormFlowField';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));
vi.mock('@/core/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/core/api')>()),
  getAllPages: (fetch) => fetch(1).then((response) => response.data),
}));

describe('validateOpenDays', () => {
  it('takes 0 and whole days', () => {
    expect(validateOpenDays(0)).toBeUndefined();
    expect(validateOpenDays('30')).toBeUndefined();
  });
  it('refuses negative or fractional days', () => {
    expect(validateOpenDays(-1)).toBeDefined();
    expect(validateOpenDays(1.5)).toBeDefined();
  });
});

describe('CallFormFlowField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    vi.mocked(formFlowsList).mockResolvedValue({
      data: [
        { uuid: 'a', name: 'AIRR application', purpose: 'application' },
        { uuid: 'c', name: 'AIRR end of project', purpose: 'closing' },
      ],
    } as any);
  });

  it("shows the call's end-of-project flow and when it opens", async () => {
    vi.mocked(proposalFormCallsRetrieve).mockResolvedValue({
      data: {
        call_uuid: 'call-1',
        flow: 'a',
        flow_name: 'AIRR application',
        locked: false,
        closing_flow: 'c',
        closing_flow_name: 'AIRR end of project',
        closing_locked: false,
        closing_forms_open_days_before_end: 30,
      },
    } as any);
    renderWithProviders(<CallFormFlowField callUuid="call-1" />);
    expect(await screen.findByText('AIRR end of project')).toBeInTheDocument();
    expect(screen.getByText('30 days before the end date')).toBeInTheDocument();
  });

  it('says the site applies when the call has no end-of-project flow', async () => {
    vi.mocked(proposalFormCallsRetrieve).mockResolvedValue({
      data: {
        call_uuid: 'call-1',
        flow: null,
        locked: false,
        closing_flow: null,
        closing_locked: false,
      },
    } as any);
    renderWithProviders(<CallFormFlowField callUuid="call-1" />);
    await waitFor(() =>
      expect(
        screen.getByText("None (the site's, if it has one)"),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText('End-of-project forms open')).toBeNull();
  });
});
