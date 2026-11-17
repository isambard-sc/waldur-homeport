import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  askReportingQuestion,
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
  clearActiveReportingSessionUuid: vi.fn(),
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
    // The cache survives navigating away, so with staleTime: Infinity the
    // second visit showed the first visit's messages and missed newer ones.
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

const ask = async (text: string) => {
  const input = screen.getByLabelText('Message input');
  await waitFor(() => expect(input).toBeEnabled());
  await userEvent.type(input, `${text}{Enter}`);
};

describe('AIReportingPage conversations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('New conversation sends the next question as a new session', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages).mockResolvedValue([
      message({ uuid: 'msg-1', prompt: 'hi', answer: 'Hello.' }),
    ]);
    vi.mocked(askReportingQuestion).mockResolvedValue(
      message({ uuid: 'msg-2', session: 'session-2', status: 'pending' }),
    );

    renderPage();
    expect(await screen.findByText('Hello.')).toBeInTheDocument();
    await userEvent.click(screen.getByText('New conversation'));

    expect(screen.queryByText('Hello.')).not.toBeInTheDocument();
    await ask('next question');
    await waitFor(() =>
      expect(askReportingQuestion).toHaveBeenCalledWith({
        prompt: 'next question',
        new_session: true,
      }),
    );
  });

  it('starts a new conversation when the old one is gone', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages).mockResolvedValue([]);
    vi.mocked(askReportingQuestion)
      .mockRejectedValueOnce({ session: ['Object does not exist.'] })
      .mockResolvedValueOnce(
        message({ uuid: 'msg-2', session: 'session-2', prompt: 'again' }),
      );

    renderPage();
    await ask('again');

    expect(await screen.findByText('again')).toBeInTheDocument();
    expect(askReportingQuestion).toHaveBeenLastCalledWith({
      prompt: 'again',
      new_session: true,
    });
    expect(
      screen.queryByText('Could not send your question'),
    ).not.toBeInTheDocument();
  });

  it('does not hang when the conversation cannot be restored', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages).mockRejectedValue(new Error('500'));

    renderPage();

    expect(
      await screen.findByText('Could not load your conversation'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Message input')).toBeEnabled();
  });
});
