import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import {
  askReportingQuestion,
  getReportingMessage,
  listReportingMessages,
  ReportingMessage,
} from './aiReportingApi';
import { AIReportingNav } from './AIReportingNav';
import { MarkdownAnswer } from './MarkdownAnswer';
import { ReportFiles } from './ReportFiles';
import {
  getActiveReportingSessionUuid,
  setActiveReportingSessionUuid,
} from './session';

const POLL_INTERVAL_MS = 3000;

// There's no real mid-flight signal from the harness today - the backend
// task is one blocking call, and ReportingMessage.progress (the field meant
// for genuine per-turn status) is never actually populated - so this is a
// plausible-sounding approximation, not a true reflection of what's
// happening. Rotates on elapsed time since the question was asked, which
// lines up with the poll interval re-rendering every few seconds anyway.
// message.progress (if it's ever wired up for real) always wins over this.
const PENDING_PHASES = [
  translate('Looking up the data...'),
  translate('Analysing...'),
  translate('Building your report...'),
];
const PENDING_PHASE_DURATION_MS = 6000;

const pendingPhase = (createdAt: string): string => {
  const elapsed = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const index =
    Math.floor(elapsed / PENDING_PHASE_DURATION_MS) % PENDING_PHASES.length;
  return PENDING_PHASES[index];
};

// A standalone page rather than a drawer: this is a deliberate reporting task
// (not an ambient "quick question" the way the general assistant is), and
// generated files/charts need real screen room to list. Gated by the
// admin-configurable AI_REPORTING_ENABLED_ROLES, not a fixed staff/support
// check - see the explicit permissions on this route in ../reporting/routes.ts.
export const AIReportingPage: FC = () => {
  // Captured once, at mount: the session (if any) this tab was already
  // talking to before this page last unmounted - e.g. the user navigated to
  // another tab and back. Reading the module state again on a later render
  // would make a conversation that starts fresh here think it still needs
  // restoring once it has its own session going.
  const [restoreSessionUuid] = useState(() => getActiveReportingSessionUuid());
  const [sessionUuid, setSessionUuid] = useState<string | null>(
    restoreSessionUuid ?? null,
  );
  const [messages, setMessages] = useState<ReportingMessage[]>([]);
  const [pendingUuid, setPendingUuid] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const { data: restoredMessages } = useQuery({
    queryKey: ['AIReportingRestoreSession', restoreSessionUuid],
    queryFn: () => listReportingMessages(restoreSessionUuid as string),
    enabled: !!restoreSessionUuid,
    // NOT staleTime: Infinity - react-query's cache is keyed globally, not
    // per mount, and this same session uuid is reused every time the page
    // is navigated away from and back to within one page load. An infinite
    // staleTime made the *second* restore replay the *first* restore's
    // snapshot verbatim (e.g. still just "hi", with a later "yes please"
    // missing) instead of fetching what the session actually looks like
    // now. refetchOnMount: 'always' means every remount still shows last
    // known data instantly (no flash of the restoring spinner for a
    // conversation already seen once this page load) but always confirms
    // it against the server right after.
    refetchOnMount: 'always',
    retry: false,
  });

  // Nothing to restore -> already "restored". Otherwise stays false until
  // the hydration effect below has actually populated messages, so the
  // composer below doesn't accept a question that the restore is about to
  // overwrite the message list underneath. Derived rather than its own
  // state: it's exactly "restoredMessages has arrived (or there was never
  // anything to wait for)", nothing more to keep in sync by hand.
  const hasRestored = !restoreSessionUuid || restoredMessages !== undefined;

  useEffect(() => {
    if (!restoredMessages) return;
    setMessages(restoredMessages);
    // The page may have been navigated away from mid-answer - resume
    // polling exactly like a freshly-asked question would, instead of
    // leaving a stale "pending" bubble with nothing watching it.
    const last = restoredMessages[restoredMessages.length - 1];
    if (last?.status === 'pending') {
      setPendingUuid(last.uuid);
    }
  }, [restoredMessages]);

  const askMutation = useMutation({
    mutationFn: (nextPrompt: string) =>
      askReportingQuestion(
        sessionUuid
          ? { prompt: nextPrompt, session: sessionUuid }
          : { prompt: nextPrompt, new_session: true },
      ),
    onSuccess: (message) => {
      setSessionUuid(message.session);
      setActiveReportingSessionUuid(message.session);
      setMessages((prev) => [...prev, message]);
      setPendingUuid(message.uuid);
      setPrompt('');
    },
  });

  const { data: polledMessage } = useQuery({
    queryKey: ['AIReportingMessage', pendingUuid],
    queryFn: () => getReportingMessage(pendingUuid as string),
    enabled: !!pendingUuid,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return POLL_INTERVAL_MS;
      return data.status === 'pending' ? POLL_INTERVAL_MS : false;
    },
  });

  // Each poll (including the final, settled one) replaces its message in
  // place; once status is no longer pending, stop polling it.
  useEffect(() => {
    if (!polledMessage) return;
    setMessages((prev) =>
      prev.map((m) => (m.uuid === polledMessage.uuid ? polledMessage : m)),
    );
    if (polledMessage.status !== 'pending') {
      setPendingUuid(null);
    }
  }, [polledMessage]);

  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed || askMutation.isPending) return;
    askMutation.mutate(trimmed);
  };

  return (
    <div className="ai-reporting-page">
      <AIReportingNav />
      <AlertItem
        variant="info"
        type="floating"
        title={translate('Reminder')}
        body={translate(
          'Responses are generated by AI and may be inaccurate. Verify figures before sharing a report.',
        )}
      />

      <div className="ai-reporting-messages mt-4 mb-4">
        {!hasRestored ? (
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
          disabled={!hasRestored || askMutation.isPending || !!pendingUuid}
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
          disabled={
            !hasRestored ||
            !prompt.trim() ||
            askMutation.isPending ||
            !!pendingUuid
          }
          disabledReason={
            !hasRestored
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
          title={translate('Could not reach the AI reporting harness')}
          body={translate('Try again in a moment.')}
        />
      ) : null}
    </div>
  );
};
