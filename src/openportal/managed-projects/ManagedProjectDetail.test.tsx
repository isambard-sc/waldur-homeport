import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openportalManagedProjectsRetrieveGet } from 'waldur-js-client';

import { ModalProvider } from '@/modal/ModalContext';
import { renderWithProviders } from '@/test/harness';

import { ManagedProjectDetail } from './ManagedProjectDetail';

vi.mock('./ManagedProjectAuditLog', () => ({
  ManagedProjectAuditLog: () => null,
}));
vi.mock('./ManagedProjectActions', () => ({
  ManagedProjectActions: () => null,
}));
vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));

const award: any = {
  identifier: 'award-42',
  destination: 'airr.brics.isambard-ai',
  state: 'pending',
  created: '2026-10-01T09:00:00Z',
  project_template_data: {
    name: 'AIRR template',
    role_mapping_data: {
      PI: { name: 'PROJECT.MANAGER', description: 'Project manager' },
    },
  },
  details: {
    name: 'Timing the SDF',
    allocation: '2000 NHR',
    breakdown: { GPU: '1500 NHR', CPU: '500 NHR' },
    members: { 'pi@example.ac.uk': 'PI' },
    award: { id: 'AW-1', url: 'https://awards.example.org/AW-1' },
    allowed_domains: [],
    notes: [],
  },
};

describe('ManagedProjectDetail', () => {
  beforeEach(() => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      params: { identifier: 'award-42', destination: 'airr.brics.isambard-ai' },
    } as any);
    vi.mocked(openportalManagedProjectsRetrieveGet).mockResolvedValue({
      data: award,
    } as any);
  });

  it('shows the award in full, with a way to write to the awarding portal', async () => {
    renderWithProviders(
      <ModalProvider>
        <ManagedProjectDetail />
      </ModalProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Timing the SDF' }),
    ).toBeInTheDocument();
    // The breakdown of the allocation.
    expect(screen.getByText('1500 NHR')).toBeInTheDocument();
    // What each member becomes here, not the awarding portal's role.
    expect(screen.getByText('Project manager')).toBeInTheDocument();
    // An empty list of domains admits nobody.
    expect(screen.getByText('No domains allowed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AW-1' })).toHaveAttribute(
      'href',
      'https://awards.example.org/AW-1',
    );
    expect(
      screen.getByRole('button', { name: 'Add note' }),
    ).toBeInTheDocument();
  });
});
