import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openportalAccessForEmailList } from 'waldur-js-client';

import { goToNotFound } from '@/error/utils';
import { renderWithProviders } from '@/test/harness';

import { AccessForEmail, fetchAccess } from './AccessForEmail';

vi.mock('@/error/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/error/utils')>()),
  goToNotFound: vi.fn(),
}));

// A real response for an email search: one object, not a list.
const SINGLE: any = {
  email: 'a.kawafi+dev@bristol.ac.uk',
  status: 'active',
  short_name: 'akawafidev',
  projects: {
    'platforms-dev.brics': {
      name: 'Platforms Development Project',
      resources: [
        {
          name: 'brics.aip1.notebooks.shared',
          username: 'akawafidev.platforms-dev',
        },
      ],
    },
  },
  invited_by: '',
  reason: '',
};

const notFound = {
  error: "No results found for query: 'nobody'.",
  status: 404,
  response: { status: 404 },
};

describe('fetchAccess', () => {
  beforeEach(() => vi.clearAllMocks());

  it('wraps a single match in a list', async () => {
    vi.mocked(openportalAccessForEmailList).mockResolvedValue({
      data: SINGLE,
    } as any);

    expect(await fetchAccess('a.kawafi+dev@bristol.ac.uk')).toEqual([SINGLE]);
  });

  it('passes a list through', async () => {
    vi.mocked(openportalAccessForEmailList).mockResolvedValue({
      data: [SINGLE, SINGLE],
    } as any);

    expect(await fetchAccess('platforms-dev')).toHaveLength(2);
  });

  // "Nothing matched" is a 404 with a reason: an answer, not a failure.
  it('treats a 404 as no results', async () => {
    vi.mocked(openportalAccessForEmailList).mockRejectedValue(notFound);

    expect(await fetchAccess('nobody')).toEqual([]);
  });

  it('lets any other error through', async () => {
    const refused = { error: 'Only your own email.', status: 403 };
    vi.mocked(openportalAccessForEmailList).mockRejectedValue(refused);

    await expect(fetchAccess('someone@else.ac.uk')).rejects.toBe(refused);
  });
});

describe('AccessForEmail', () => {
  beforeEach(() => vi.clearAllMocks());

  const search = async (text: string) => {
    renderWithProviders(<AccessForEmail />);
    await userEvent.type(
      screen.getByPlaceholderText(/Enter email, short name/),
      text,
    );
  };

  it('shows a single match', async () => {
    vi.mocked(openportalAccessForEmailList).mockResolvedValue({
      data: SINGLE,
    } as any);

    await search('a.kawafi+dev@bristol.ac.uk');

    expect(
      await screen.findByText('Platforms Development Project'),
    ).toBeInTheDocument();
  });

  // A 404 used to send the whole app to the Not Found page.
  it('shows "No results found" for a 404, without leaving the page', async () => {
    vi.mocked(openportalAccessForEmailList).mockRejectedValue(notFound);

    await search('nobody');

    expect(await screen.findByText('No results found')).toBeInTheDocument();
    expect(goToNotFound).not.toHaveBeenCalled();
  });

  it("shows the endpoint's reason for a refusal", async () => {
    vi.mocked(openportalAccessForEmailList).mockRejectedValue({
      error: 'You can only search by your own email address.',
      status: 403,
      response: { status: 403 },
    });

    await search('someone@else.ac.uk');

    await waitFor(() =>
      expect(
        screen.getByText('You can only search by your own email address.'),
      ).toBeInTheDocument(),
    );
  });
});
