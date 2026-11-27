import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  askReportingQuestion,
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
  title: '',
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

  it('keeps checking a question that was still running when the page was left', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages)
      .mockResolvedValueOnce([message({ uuid: 'msg-1', status: 'pending' })])
      .mockResolvedValue([
        message({ uuid: 'msg-1', status: 'done', answer: 'Seventeen.' }),
      ]);

    renderPage();

    expect(
      await screen.findByText('Seventeen.', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Message input')).toBeEnabled();
  }, 10_000);

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
    const restarted = message({
      uuid: 'msg-2',
      session: 'session-2',
      prompt: 'again',
    });
    vi.mocked(listReportingMessages).mockImplementation((session) =>
      Promise.resolve(session === 'session-2' ? [restarted] : []),
    );
    vi.mocked(askReportingQuestion)
      .mockRejectedValueOnce({ session: ['Object does not exist.'] })
      .mockResolvedValueOnce(restarted);

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

  it('stops waiting and unlocks the page when checking on a question fails', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages)
      .mockResolvedValueOnce([message({ uuid: 'msg-1', status: 'pending' })])
      .mockRejectedValue({ detail: 'AI reporting is disabled.' });

    renderPage();

    // Shown on the page and announced as an alert.
    expect(
      await screen.findAllByText(
        'AI reporting is disabled.',
        {},
        { timeout: 8000 },
      ),
    ).toHaveLength(2);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'AI reporting is disabled.',
    );
    expect(screen.getByLabelText('Message input')).toBeEnabled();
    const calls = vi.mocked(listReportingMessages).mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 3500));
    expect(listReportingMessages).toHaveBeenCalledTimes(calls);
  }, 15_000);

  it('keeps waiting through one failed check', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages)
      .mockResolvedValueOnce([message({ uuid: 'msg-1', status: 'pending' })])
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValue([message({ uuid: 'msg-1', answer: 'Seventeen.' })]);

    renderPage();

    expect(
      await screen.findByText('Seventeen.', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText('The request failed')).not.toBeInTheDocument();
    expect(screen.getByText('Answer ready.')).toBeInTheDocument();
  }, 10_000);

  it('does not announce an old failure when a conversation is reopened', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    vi.mocked(listReportingMessages).mockResolvedValue([
      message({ uuid: 'msg-1', status: 'failed', error_message: 'Old error.' }),
    ]);

    renderPage();

    expect(await screen.findByText('Old error.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('limits a question to the length the server accepts', () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue(undefined);

    renderPage();

    expect(screen.getByLabelText('Message input')).toHaveAttribute(
      'maxLength',
      '10000',
    );
  });

  it('shows why a question was refused', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue(undefined);
    vi.mocked(askReportingQuestion).mockRejectedValue({
      prompt: ['Ensure this field has no more than 10000 characters.'],
    });

    renderPage();
    await userEvent.type(screen.getByLabelText('Message input'), 'hi{Enter}');

    expect(
      await screen.findAllByText(
        'Ensure this field has no more than 10000 characters.',
      ),
    ).not.toHaveLength(0);
    expect(
      screen.queryByText('Try again in a moment.'),
    ).not.toBeInTheDocument();
  });

  it('shows a new question straight away and its answer when it arrives', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue(undefined);
    const asked = message({
      uuid: 'msg-9',
      session: 'session-9',
      prompt: 'chart the projects',
      status: 'pending',
      progress: 'Fetching projects from Waldur',
    });
    vi.mocked(askReportingQuestion).mockResolvedValue(asked);
    vi.mocked(listReportingMessages)
      .mockResolvedValueOnce([asked])
      .mockResolvedValue([
        {
          ...asked,
          status: 'done',
          progress: '',
          answer: 'Here is the chart.',
        },
      ]);

    renderPage();
    await ask('chart the projects');

    expect(await screen.findByText('chart the projects')).toBeInTheDocument();
    expect(screen.getByLabelText('Message input')).toBeDisabled();
    expect(
      await screen.findByText('Here is the chart.', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Answer ready.')).toBeInTheDocument();
    expect(screen.getByLabelText('Message input')).toBeEnabled();
  }, 10_000);

  it('keeps a question asked while an older refresh is still loading', async () => {
    vi.mocked(getActiveReportingSessionUuid).mockReturnValue('session-1');
    const first = message({ uuid: 'msg-1', prompt: 'hi', answer: 'Hello.' });
    const second = message({
      uuid: 'msg-2',
      prompt: 'and now?',
      status: 'pending',
    });
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const renderOnSharedClient = () =>
      render(
        <QueryClientProvider client={client}>
          <AIReportingPage />
        </QueryClientProvider>,
      );
    vi.mocked(listReportingMessages).mockResolvedValueOnce([first]);
    const { unmount } = renderOnSharedClient();
    expect(await screen.findByText('Hello.')).toBeInTheDocument();
    unmount();

    // Back on the page: the cached copy shows at once, its refresh is slow.
    let finishSlowRefresh: (messages: ReportingMessage[]) => void;
    vi.mocked(listReportingMessages)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finishSlowRefresh = resolve;
        }),
      )
      .mockResolvedValue([first, second]);
    vi.mocked(askReportingQuestion).mockResolvedValue(second);
    renderOnSharedClient();
    await ask('and now?');
    expect(await screen.findByText('and now?')).toBeInTheDocument();

    finishSlowRefresh!([first]);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.getByText('and now?')).toBeInTheDocument();
    expect(screen.getByLabelText('Message input')).toBeDisabled();
  });
});
