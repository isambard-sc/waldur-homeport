import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { renderWithProviders } from '@/test/harness';

import { AdministrationCallManagement } from './AdministrationCallManagement';

vi.mock('@/features/connect', () => ({ isFeatureVisible: vi.fn() }));
// The cards have tests of their own.
vi.mock('./FormbricksConnectionCard', () => ({
  FormbricksConnectionCard: () => <div>Formbricks connection card</div>,
}));
vi.mock('./FormFlowsCard', () => ({
  FormFlowsCard: () => <div>Form flows card</div>,
}));
vi.mock('./SiteClosingFlowCard', () => ({
  SiteClosingFlowCard: () => <div>End-of-project forms card</div>,
}));

const openTab = (tab?: string) =>
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'admin-call-management' },
    params: { tab },
  } as any);

describe('AdministrationCallManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(overrideSettingsRetrieve).mockResolvedValue({ data: {} } as any);
    openTab();
  });

  it('gives application forms a tab of their own', async () => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    openTab('application-forms');
    renderWithProviders(<AdministrationCallManagement />);

    expect(
      await screen.findByRole('tab', { name: 'Application forms' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Formbricks connection card')).toBeInTheDocument();
    expect(screen.getByText('Form flows card')).toBeInTheDocument();
    expect(screen.getByText('End-of-project forms card')).toBeInTheDocument();
  });

  it('keeps them off the other tabs', async () => {
    vi.mocked(isFeatureVisible).mockReturnValue(true);
    openTab('proposal');
    renderWithProviders(<AdministrationCallManagement />);

    await screen.findByRole('tab', { name: 'Proposal' });
    expect(screen.queryByText('Formbricks connection card')).toBeNull();
  });

  it('has no such tab while the feature is off', async () => {
    vi.mocked(isFeatureVisible).mockReturnValue(false);
    renderWithProviders(<AdministrationCallManagement />);

    await screen.findByRole('tab', { name: 'Proposal' });
    expect(screen.queryByRole('tab', { name: 'Application forms' })).toBeNull();
  });
});
