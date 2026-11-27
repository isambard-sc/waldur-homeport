import { screen, waitFor } from '@testing-library/react';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchHarnessConnection } from '@/ai-reporting/harnessConnectionApi';
import { renderWithProviders } from '@/test/harness';

import { HarnessConnectionFields } from './HarnessConnectionFields';

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useSelector: vi.fn(),
}));

vi.mock('@/ai-reporting/harnessConnectionApi', () => ({
  fetchHarnessConnection: vi.fn(),
  updateHarnessConnection: vi.fn(),
}));

const connection = (overrides = {}) => ({
  base_url: 'http://waldur-harness.waldur-harness.svc.cluster.local:8000',
  signing_private_key_set: false,
  modified: '2026-11-05T10:00:00Z',
  ...overrides,
});

const asStaff = (staff: boolean) =>
  vi.mocked(useSelector).mockImplementation(() => staff);

describe('HarnessConnectionFields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asStaff(true);
    vi.mocked(fetchHarnessConnection).mockResolvedValue(connection() as any);
  });

  it('shows the harness URL', async () => {
    renderWithProviders(<HarnessConnectionFields />);
    expect(
      await screen.findByText(
        'http://waldur-harness.waldur-harness.svc.cluster.local:8000',
      ),
    ).toBeInTheDocument();
  });

  it('says whether the signing key is set, never what it is', async () => {
    vi.mocked(fetchHarnessConnection).mockResolvedValue(
      connection({ signing_private_key_set: true }) as any,
    );
    renderWithProviders(<HarnessConnectionFields />);
    expect(await screen.findByText('Set')).toBeInTheDocument();
  });

  it('shows "Not set" when no signing key is configured', async () => {
    renderWithProviders(<HarnessConnectionFields />);
    expect(await screen.findByText('Not set')).toBeInTheDocument();
  });

  it('is read-only to anyone but staff', async () => {
    asStaff(false);
    renderWithProviders(<HarnessConnectionFields />);
    await screen.findByText('Harness URL');
    for (const name of ['base_url', 'signing_private_key']) {
      await waitFor(() =>
        expect(screen.getByTestId(`edit-${name}`)).toBeDisabled(),
      );
    }
  });

  it('staff can edit the harness URL', async () => {
    renderWithProviders(<HarnessConnectionFields />);
    await screen.findByText('Harness URL');
    expect(screen.getByTestId('edit-base_url')).not.toBeDisabled();
  });
});
