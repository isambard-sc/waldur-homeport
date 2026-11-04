import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getReportingMessage,
  listReportingMessages,
  ReportingMessage,
} from './aiReportingApi';
import { AIReportingPage } from './AIReportingPage';
import { getActiveReportingSessionUuid } from './session';

vi.mock('./AIReportingNav', () => ({ AIReportingNav: () => null }));
vi.mock('./aiReportingApi', async () => {
  const actual = await vi.importActual('./aiReportingApi');
  return {
    ...actual,
    askReportingQuestion: vi.fn(),
    getReportingMessage: vi.fn(),
    listReportingMessages: vi.fn(),
  };
});
vi.mock('./session', () => ({
  getActiveReportingSessionUuid: vi.fn(),
  setActiveReportingSessionUuid: vi.fn(),
}));

const message = (overrides: Partial<ReportingMessage>): ReportingMessage => ({
  uuid: 'msg-1',
  session: 'session-1',
  prompt: 'how many projects?',
  answer: '',
  status: 'done',
  progress: '',
  new_files: [],
  files: [],
  error_message: '',
  created: '2026-11-03T10:00:00Z',
  ...overrides,
});

const renderPage = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <AIReportingPage />
    </QueryClientProvider>,
  );

describe('AIReportingPage session restore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts from an empty page when there is nothing to restore', () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue(undefined);

    renderPage();

    expect(
      screen.queryByText('Restoring your conversation...'),
    ).not.toBeInTheDocument();
    expect(listReportingMessages).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Message input')).toBeEnabled();
  });

  it("restores a prior session's messages instead of starting blank", async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages).mockResolvedValue([
      message({
        uuid: 'msg-1',
        prompt: 'how many projects?',
        answer: 'Seventeen.',
      }),
    ]);

    renderPage();

    expect(await screen.findByText('how many projects?')).toBeInTheDocument();
    expect(screen.getByText('Seventeen.')).toBeInTheDocument();
    expect(listReportingMessages).toHaveBeenCalledWith('session-1');
    expect(
      screen.queryByText('Restoring your conversation...'),
    ).not.toBeInTheDocument();
  });

  it('resumes polling a message that was still pending when the page was left', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages).mockResolvedValue([
      message({ uuid: 'msg-1', status: 'pending' }),
    ]);
    vi.mocked(getReportingMessage).mockResolvedValue(
      message({ uuid: 'msg-1', status: 'done', answer: 'Seventeen.' }),
    );

    renderPage();

    await waitFor(() =>
      expect(getReportingMessage).toHaveBeenCalledWith('msg-1'),
    );
    expect(await screen.findByText('Seventeen.')).toBeInTheDocument();
  });

  it('refetches a session already restored once this page load, instead of replaying that first snapshot', async () => {
    // Reproduces the actual bug: the same QueryClient instance persists
    // across a navigate-away-and-back cycle (React Query's cache is keyed
    // globally, not per component mount), and the restored session uuid is
    // identical both times - a staleTime: Infinity on the restore query
    // made the second mount replay the first mount's already-resolved
    // snapshot verbatim, so a message sent during the first mount (after
    // that snapshot was taken) never appeared on the second.
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages)
      .mockResolvedValueOnce([message({ uuid: 'msg-1', prompt: 'hi' })])
      .mockResolvedValueOnce([
        message({ uuid: 'msg-1', prompt: 'hi' }),
        message({ uuid: 'msg-2', prompt: 'yes please' }),
      ]);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const renderOnSharedClient = () =>
      render(
        <QueryClientProvider client={client}>
          <AIReportingPage />
        </QueryClientProvider>,
      );

    const { unmount } = renderOnSharedClient();
    expect(await screen.findByText('hi')).toBeInTheDocument();
    unmount();

    renderOnSharedClient();

    expect(await screen.findByText('yes please')).toBeInTheDocument();
  });

  it('disables the composer until restoration has actually finished', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    let resolveList: (messages: ReportingMessage[]) => void;
    vi.mocked(listReportingMessages).mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      }),
    );

    renderPage();

    expect(
      await screen.findByText('Restoring your conversation...'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Message input')).toBeDisabled();

    resolveList([]);

    await waitFor(() =>
      expect(screen.getByLabelText('Message input')).toBeEnabled(),
    );
  });
});
