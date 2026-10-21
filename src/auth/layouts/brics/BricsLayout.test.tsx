import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminAnnouncement, adminAnnouncementsList } from 'waldur-js-client';

import { configureApiClient } from 'waldur-api-client';

import { getIdentityProviders } from '@/administration/api';
import { ENV } from '@/core/config';
import { goToNotFound } from '@/error/utils';
import { ModalProvider } from '@/modal/ModalContext';
import { renderWithProviders } from '@/test/harness';

import { BricsLayout } from './BricsLayout';
import { MAX_LOGIN_NOTICES, selectLoginNotices } from './loginNotices';

vi.mock('@/administration/api', () => ({ getIdentityProviders: vi.fn() }));

vi.mock('@/error/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/error/utils')>()),
  goToNotFound: vi.fn(),
}));

const notice = (
  uuid: string,
  type: AdminAnnouncement['type'],
  active_from: string,
  description = `Notice ${uuid}`,
): AdminAnnouncement =>
  ({ uuid, type, active_from, description }) as AdminAnnouncement;

describe('selectLoginNotices', () => {
  it('puts the most severe first, then the newest', () => {
    const selected = selectLoginNotices([
      notice('old-info', 'information', '2026-10-01T00:00:00Z'),
      notice('new-info', 'information', '2026-10-10T00:00:00Z'),
      notice('danger', 'danger', '2026-09-01T00:00:00Z'),
      notice('warning', 'warning', '2026-10-05T00:00:00Z'),
    ]);
    expect(selected.map((n) => n.uuid)).toEqual([
      'danger',
      'warning',
      'new-info',
    ]);
  });

  it(`shows at most ${MAX_LOGIN_NOTICES}`, () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      notice(`n${i}`, 'information', `2026-10-0${i + 1}T00:00:00Z`),
    );
    expect(selectLoginNotices(many)).toHaveLength(MAX_LOGIN_NOTICES);
  });

  it('skips notices with nothing to say', () => {
    expect(
      selectLoginNotices([
        notice('blank', 'danger', '2026-10-01T00:00:00Z', '  '),
        notice('real', 'information', '2026-10-01T00:00:00Z'),
      ]).map((n) => n.uuid),
    ).toEqual(['real']);
  });
});

const renderLayout = () =>
  renderWithProviders(
    <ModalProvider>
      <BricsLayout />
    </ModalProvider>,
  );

describe('BricsLayout', () => {
  beforeAll(() =>
    configureApiClient({ apiEndpoint: 'https://api.example.org/' }),
  );

  beforeEach(() => {
    vi.clearAllMocks();
    ENV.apiEndpoint = 'https://api.example.org/';
    ENV.plugins = {
      WALDUR_CORE: {
        SHORT_PAGE_TITLE: 'BriCS',
        SITE_DESCRIPTION: 'Bristol Centre for Supercomputing',
        HERO_LINK_URL: 'https://docs.example.org/start',
        HERO_LINK_LABEL: 'How to get started',
        DOCS_URL: 'https://docs.example.org',
        SUPPORT_PORTAL_URL: '',
        SITE_EMAIL: '',
        AUTHENTICATION_METHODS: [],
      },
      WALDUR_AUTH_SAML2: {},
    } as any;
    vi.mocked(getIdentityProviders).mockResolvedValue([
      { provider: 'keycloak', label: 'Click here to login' },
    ] as any);
    vi.mocked(adminAnnouncementsList).mockResolvedValue({ data: [] } as any);
  });

  it('logs in through the identity provider with its own label', async () => {
    renderLayout();

    const button = await screen.findByRole('button', { name: 'Log in' });
    expect(screen.queryByText(/Click here to login/)).not.toBeInTheDocument();

    await userEvent.click(button);
    expect(window.location.href).toContain(
      'https://api.example.org/api-auth/keycloak/init/',
    );
  });

  it('offers any further identity providers in the usual way', async () => {
    vi.mocked(getIdentityProviders).mockResolvedValue([
      { provider: 'keycloak', label: 'Keycloak' },
      { provider: 'eduteams', label: 'MyAccessID' },
    ] as any);
    renderLayout();

    expect(
      await screen.findByRole('button', { name: 'Log in' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sign in with MyAccessID')).toBeInTheDocument();
  });

  it('shows the site message and only the links that are set', async () => {
    renderLayout();

    expect(
      screen.getByRole('heading', {
        name: 'Bristol Centre for Supercomputing',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /How to get started/ }),
    ).toHaveAttribute('href', 'https://docs.example.org/start');
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
      'href',
      'https://docs.example.org',
    );
    expect(
      screen.queryByRole('link', { name: 'Support' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Contact us' }),
    ).not.toBeInTheDocument();
    await screen.findByRole('button', { name: 'Log in' });
  });

  it('shows the current announcements', async () => {
    vi.mocked(adminAnnouncementsList).mockResolvedValue({
      data: [
        notice('n1', 'danger', '2026-10-20T00:00:00Z', 'Login nodes are down'),
      ],
    } as any);
    renderLayout();

    expect(await screen.findByText('Login nodes are down')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Service status and news' }),
    ).toBeInTheDocument();
    expect(adminAnnouncementsList).toHaveBeenCalledWith({
      query: { is_active: true, page_size: 20 },
    });
  });

  it('carries on without notices when they cannot be loaded', async () => {
    vi.mocked(adminAnnouncementsList).mockRejectedValue({
      status: 404,
      response: { status: 404 },
    });
    renderLayout();

    await waitFor(() => expect(adminAnnouncementsList).toHaveBeenCalled());
    expect(
      await screen.findByRole('button', { name: 'Log in' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Service status and news'),
    ).not.toBeInTheDocument();
    expect(goToNotFound).not.toHaveBeenCalled();
  });

  it('shows the local login form straight away when it is the only way in', async () => {
    ENV.apiEndpoint = 'http://localhost:8080/';
    ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS = ['LOCAL_SIGNIN'];
    vi.mocked(getIdentityProviders).mockResolvedValue([]);
    renderLayout();

    expect(
      await screen.findByRole('button', { name: 'Login' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sign in with local account' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Back to all sign-in options/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps the local login behind a link when Keycloak is there too', async () => {
    ENV.apiEndpoint = 'http://localhost:8080/';
    ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS = ['LOCAL_SIGNIN'];
    renderLayout();

    expect(
      await screen.findByRole('button', { name: 'Log in' }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Sign in with local account' }),
    );
    expect(
      await screen.findByRole('button', { name: 'Login' }),
    ).toBeInTheDocument();
  });

  it('says so when there is no way to log in', async () => {
    vi.mocked(getIdentityProviders).mockResolvedValue([]);
    renderLayout();

    expect(
      await screen.findByText('Logging in is not available at the moment.'),
    ).toBeInTheDocument();
  });
});
