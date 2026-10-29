import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formbricksConnectionRetrieve,
  formbricksConnectionTest,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { FormbricksConnectionCard } from './FormbricksConnectionCard';

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useSelector: vi.fn(),
}));

const connection = (overrides = {}) => ({
  data: {
    enabled: false,
    base_url: 'https://forms.example.org',
    management_api_url: 'http://formbricks:3000',
    api_key_set: true,
    webhook_secret_set: false,
    is_configured: false,
    webhook_url: 'https://portal-api.example.org/api/proposal-form-webhook/',
    modified: '2026-10-29T10:00:00Z',
    ...overrides,
  },
});

const asStaff = (staff: boolean) =>
  vi.mocked(useSelector).mockImplementation(() => staff);

describe('FormbricksConnectionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asStaff(true);
    vi.mocked(formbricksConnectionRetrieve).mockResolvedValue(
      connection() as any,
    );
  });

  it('says whether each secret is set, never what it is', async () => {
    renderWithProviders(<FormbricksConnectionCard />);
    expect(await screen.findByText('API key')).toBeInTheDocument();
    expect(screen.getByText('Set')).toBeInTheDocument();
    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  it('shows the webhook URL to paste into Formbricks', async () => {
    renderWithProviders(<FormbricksConnectionCard />);
    expect(
      await screen.findByText(
        'https://portal-api.example.org/api/proposal-form-webhook/',
      ),
    ).toBeInTheDocument();
  });

  it('cannot be enabled or tested until it is fully configured', async () => {
    renderWithProviders(<FormbricksConnectionCard />);
    await screen.findByText('API key');
    expect(screen.getByTestId('edit-enabled')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Test connection' }),
    ).toBeDisabled();
  });

  it('reports what a test of the connection found', async () => {
    vi.mocked(formbricksConnectionRetrieve).mockResolvedValue(
      connection({ is_configured: true, webhook_secret_set: true }) as any,
    );
    vi.mocked(formbricksConnectionTest).mockResolvedValue({
      data: { ok: false, detail: 'The API key was refused.' },
    } as any);
    renderWithProviders(<FormbricksConnectionCard />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Test connection' }),
    );
    expect(
      await screen.findByText('The API key was refused.'),
    ).toBeInTheDocument();
    expect(screen.getByText('The connection failed')).toBeInTheDocument();
    expect(screen.getByTestId('edit-enabled')).not.toBeDisabled();
  });

  it('is read-only to anyone but staff', async () => {
    asStaff(false);
    vi.mocked(formbricksConnectionRetrieve).mockResolvedValue(
      connection({ is_configured: true, webhook_secret_set: true }) as any,
    );
    renderWithProviders(<FormbricksConnectionCard />);
    await screen.findByText('API key');
    for (const name of ['enabled', 'base_url', 'api_key', 'webhook_secret']) {
      await waitFor(() =>
        expect(screen.getByTestId(`edit-${name}`)).toBeDisabled(),
      );
    }
  });
});
