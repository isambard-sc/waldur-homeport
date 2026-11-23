import { PaperPlaneTiltIcon, PlusIcon } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useRef, useState } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import {
  askReportingQuestion,
  listReportingMessages,
  ReportingMessage,
} from './aiReportingApi';
import { AIReportingNav } from './AIReportingNav';
import { MarkdownAnswer } from './MarkdownAnswer';
import { ReportFiles } from './ReportFiles';
import {
  clearActiveReportingSessionUuid,
  getActiveReportingSessionUuid,
  setActiveReportingSessionUuid,
} from './session';

const POLL_INTERVAL_MS = 3000;
// A failed check is retried this often before the question is shown as
// failed, so one network blip doesn't end it.
const POLL_RETRIES = 2;
const POLL_RETRY_DELAY_MS = 1000;
// The backend's limit, so a long paste is stopped here, not refused later.
const MAX_PROMPT_CHARS = 10_000;

// A failed request throws the parsed body, so a limit (429), a question
// already in progress (409) or a refused question (400 on `prompt`) arrives
// with the server's own text.
const errorDetail = (error: unknown): string | null => {
  const detail = (error as any)?.detail ?? (error as any)?.prompt?.[0];
  return typeof detail === 'string' && detail ? detail : null;
};

// A 400 on `session` means that conversation is gone (deleted by retention,
// or another user logged in in this tab).
const isGoneSession = (error: unknown): boolean => !!(error as any)?.session;

// Shown until the harness sends its first progress line (message.progress),
// or if it never does: rotates through plausible phases by elapsed time.
const PENDING_PHASE_DURATION_MS = 6000;

const pendingPhase = (createdAt: string): string => {
  const phases = [
    translate('Looking up the data...'),
    translate('Analysing...'),
    translate('Building your report...'),
  ];
  const elapsed = Math.max(0, Date.now() - new Date(createdAt).getTime());
  return phases[
    Math.floor(elapsed / PENDING_PHASE_DURATION_MS) % phases.length
  ];
};

const conversationKey = (sessionUuid: string | null) => [
  'AIReportingConversation',
  sessionUuid,
];

const lastIsPending = (messages?: ReportingMessage[]) =>
  messages?.[messages.length - 1]?.status === 'pending';

// What screen readers hear: progress and answers politely, failures as
// alerts. Only for a question that was running while the page was open.
const announcements = (
  last: ReportingMessage | undefined,
  watched: boolean,
  askError: unknown,
): { status: string; alert: string } => {
  if (askError) {
    return {
      status: '',
      alert:
        errorDetail(askError) || translate('Could not send your question.'),
    };
  }
  if (!last || !watched) return { status: '', alert: '' };
  if (last.status === 'pending') {
    return {
      status: last.progress || translate('Working on your question.'),
      alert: '',
    };
  }
  if (last.status === 'done') {
    return { status: translate('Answer ready.'), alert: '' };
  }
  return {
    status: '',
    alert: last.error_message || translate('The request failed.'),
  };
};

// When checking on a running question keeps failing (feature switched off,
// role removed), show it as failed so the page stops waiting for it.
const withFailedCheck = (
  messages: ReportingMessage[],
  error: unknown,
): ReportingMessage[] => {
  if (!error || !lastIsPending(messages)) return messages;
  const reason =
    errorDetail(error) ||
    translate(
      'Could not check on this question. Reopen it from History to see if it finished.',
    );
  return [
    ...messages.slice(0, -1),
    {
      ...messages[messages.length - 1],
      status: 'failed',
      error_message: reason,
    },
  ];
};

// A full page rather than a drawer: asking for a report is a deliberate
// task, and the charts it produces need room. Access is set in routes.ts.
//
// The conversation is held in one place: the query below, which is the list
// Waldur returns for this session, re-read every few seconds while its last
// question is still running. Asking a question adds it to that list.
export const AIReportingPage: FC = () => {
  const queryClient = useQueryClient();
  // The conversation this tab was in, if the user navigated away and back.
  const [sessionUuid, setSessionUuid] = useState<string | null>(
    () => getActiveReportingSessionUuid() ?? null,
  );
  const [prompt, setPrompt] = useState('');
  const [restoreFailed, setRestoreFailed] = useState(false);
  // Questions that were running while this page was open. Only their outcome
  // is announced to screen readers, not that of a reopened conversation.
  const watched = useRef(new Set<string>());

  const hasConversationOnScreen = () =>
    queryClient.getQueryData(conversationKey(sessionUuid)) !== undefined;

  const conversation = useQuery({
    queryKey: conversationKey(sessionUuid),
    queryFn: () => listReportingMessages(sessionUuid as string),
    enabled: !!sessionUuid,
    // The cache outlives this page, so a later visit refetches rather than
    // showing an old copy.
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    // A failed check on a conversation already on screen is retried; a
    // first load that fails starts a new conversation straight away.
    retry: (failures) => hasConversationOnScreen() && failures < POLL_RETRIES,
    retryDelay: POLL_RETRY_DELAY_MS,
    refetchInterval: (query) =>
      query.state.status !== 'error' && lastIsPending(query.state.data)
        ? POLL_INTERVAL_MS
        : false,
  });

  useEffect(() => {
    // A conversation that can't be loaded at all: start a new one instead.
    if (!conversation.isError || conversation.data !== undefined) return;
    setRestoreFailed(true);
    setSessionUuid(null);
    clearActiveReportingSessionUuid();
  }, [conversation.isError, conversation.data]);

  const messages = withFailedCheck(
    conversation.data ?? [],
    conversation.isError && !conversation.isFetching
      ? conversation.error
      : null,
  );
  const last = messages[messages.length - 1];
  // Noted while rendering, since that's when a running question is seen.
  if (last?.status === 'pending') watched.current.add(last.uuid);
  const loaded = !sessionUuid || conversation.data !== undefined;

  const askMutation = useMutation({
    mutationFn: async (nextPrompt: string) => {
      if (!sessionUuid) {
        const message = await askReportingQuestion({
          prompt: nextPrompt,
          new_session: true,
        });
        return { message, newConversation: true };
      }
      try {
        const message = await askReportingQuestion({
          prompt: nextPrompt,
          session: sessionUuid,
        });
        return { message, newConversation: false };
      } catch (error) {
        if (!isGoneSession(error)) throw error;
        const message = await askReportingQuestion({
          prompt: nextPrompt,
          new_session: true,
        });
        return { message, newConversation: true };
      }
    },
    onSuccess: async ({ message, newConversation }) => {
      const key = conversationKey(message.session);
      // A check still in flight from before the question was asked would
      // otherwise land after this and drop the new question.
      await queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<ReportingMessage[]>(key, (old) =>
        newConversation || !old
          ? [message]
          : [...old.filter((m) => m.uuid !== message.uuid), message],
      );
      watched.current.add(message.uuid);
      setSessionUuid(message.session);
      setActiveReportingSessionUuid(message.session);
      setRestoreFailed(false);
      setPrompt('');
    },
  });

  const startNewConversation = () => {
    setSessionUuid(null);
    clearActiveReportingSessionUuid();
    setPrompt('');
    askMutation.reset();
  };

  const busy = askMutation.isPending || last?.status === 'pending';

  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed || askMutation.isPending) return;
    askMutation.mutate(trimmed);
  };

  const live = announcements(
    last,
    !!last && watched.current.has(last.uuid),
    askMutation.isError ? askMutation.error : null,
  );

  return (
    <div className="ai-reporting-page">
      <AIReportingNav />
      <div className="visually-hidden" aria-live="polite">
        {live.status}
      </div>
      <div className="visually-hidden" role="alert">
        {live.alert}
      </div>
      <AlertItem
        variant="info"
        type="floating"
        title={translate('Reminder')}
        body={translate(
          'Responses are generated by AI and may be inaccurate. Verify figures before sharing a report.',
        )}
      />
      {restoreFailed ? (
        <AlertItem
          variant="warning"
          type="floating"
          title={translate('Could not load your conversation')}
          body={translate('Your next question starts a new conversation.')}
        />
      ) : null}
      {messages.length ? (
        <div className="d-flex justify-content-end mt-4">
          <BaseButton
            variant="text-primary"
            size="sm"
            iconNode={<PlusIcon weight="bold" />}
            label={translate('New conversation')}
            disabled={busy}
            disabledReason={translate('Waiting for the current answer.')}
            onClick={startNewConversation}
          />
        </div>
      ) : null}

      <div className="ai-reporting-messages mt-4 mb-4">
        {!loaded ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <LoadingSpinnerSimple className="fs-4" />
            <span className="fs-7">
              {translate('Restoring your conversation...')}
            </span>
          </div>
        ) : null}
        {messages.map((message) => (
          <div key={message.uuid} className="ai-reporting-message mb-4">
            <div className="ai-reporting-question border-start border-3 border-primary ps-3 mb-2">
              <p className="text-muted fs-8 text-uppercase mb-0">
                {translate('Question')}
              </p>
              <p className="fw-bold mb-0">{message.prompt}</p>
            </div>
            <div className="ai-reporting-answer bg-light rounded p-3">
              {message.status === 'pending' ? (
                <div className="d-flex align-items-center gap-2 text-muted">
                  <LoadingSpinnerSimple className="fs-4" />
                  <span className="fs-7">
                    {message.progress || pendingPhase(message.created)}
                  </span>
                </div>
              ) : message.status === 'failed' ? (
                <AlertItem
                  variant="error"
                  type="floating"
                  title={translate('The request failed')}
                  body={
                    message.error_message || translate('No details available.')
                  }
                />
              ) : (
                <>
                  <p className="text-muted fs-8 text-uppercase mb-2">
                    {translate('Answer')}
                  </p>
                  <MarkdownAnswer content={message.answer} />
                  <ReportFiles files={message.files} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="ai-reporting-composer d-flex gap-2">
        <textarea
          className="form-control"
          rows={2}
          placeholder={translate(
            'Ask for a report, e.g. "active projects by organisation this quarter"',
          )}
          value={prompt}
          maxLength={MAX_PROMPT_CHARS}
          disabled={!loaded || busy}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          aria-label={translate('Message input')}
        />
        <BaseButton
          variant="text-primary"
          size="sm"
          iconNode={<PaperPlaneTiltIcon weight="bold" />}
          label={translate('Send')}
          aria-label={translate('Send message')}
          disabled={!loaded || !prompt.trim() || busy}
          disabledReason={
            !loaded
              ? translate('Restoring your conversation...')
              : !prompt.trim()
                ? translate('Type a question first.')
                : translate('Waiting for the current answer.')
          }
          onClick={submit}
        />
      </div>
      {askMutation.isError ? (
        <AlertItem
          variant="error"
          type="floating"
          title={translate('Could not send your question')}
          body={
            errorDetail(askMutation.error) ||
            translate('Try again in a moment.')
          }
        />
      ) : null}
    </div>
  );
};
