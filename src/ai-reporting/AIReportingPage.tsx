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

// A failed request throws the parsed body, so a limit (429) or a question
// already in progress (409) arrives with the server's own `detail` text.
const errorDetail = (error: unknown): string | null => {
  const detail = (error as any)?.detail;
  return typeof detail === 'string' && detail ? detail : null;
};

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

// This is a full standalone page, not a drawer that floats over other
// content. Two reasons: asking for a report here is a deliberate task the
// user chose to do, unlike the general AI assistant feature elsewhere in
// the app, which is meant to be an ambient "quick question" you can ask
// from anywhere without leaving your current page. Also, the files this
// page's answers can produce (charts, CSVs) need real screen space to
// display properly, which a drawer doesn't have.
//
// Who can reach this page is controlled by the admin-configurable
// AI_REPORTING_ENABLED_ROLES setting, not a fixed staff/support check - see
// the permissions on this route in ../reporting/routes.ts.
export const AIReportingPage: FC = () => {
  // On the very first render, read whatever session UUID this browser tab
  // was already talking to - for example, if the user clicked away to a
  // different page in the app and has now come back. If this tab never had
  // a conversation, this is undefined, and this page starts a fresh one.
  //
  // This read only happens once per mount (that's what the function form of
  // useState's initial value does): reading it again on a later render
  // would also apply to a conversation that was started fresh on THIS
  // mount, making it think it still needs to be restored from storage, when
  // it already has its own, newer session going.
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
    //
    // Do not set staleTime: Infinity here. React Query keeps one shared
    // cache for the whole app, not a separate cache per time this
    // component mounts. Since the same session UUID is reused every time
    // this page is left and come back to within one browser tab, a second
    // visit to this page uses the exact same cache entry as the first
    // visit did.
    //
    // This caused a real bug: with staleTime: Infinity, the SECOND time you
    // opened this page, React Query would not fetch again - it would just
    // hand back the exact result from the FIRST time you opened it. For
    // example: you ask "hi", get an answer, leave the page, come back, ask
    // "yes please", leave the page again, come back again - at that third
    // visit, this component would only show "hi", because that's what was
    // cached from the very first visit; "yes please" would be missing
    // entirely, even though it really happened and is really saved on the
    // server.
    //
    // refetchOnMount: 'always' fixes this: on every mount, it still shows
    // the cached result immediately (so there's no flash of the loading
    // spinner if this conversation was already seen once this page load),
    // but it also triggers a fresh request to the server right after, and
    // updates the screen once that request comes back.
    refetchOnMount: 'always',
    retry: false,
  });

  // True once there is nothing left to wait for before the user can type a
  // new question: either there was nothing to restore in the first place
  // (restoreSessionUuid is undefined), or the restore request above has
  // finished and restoredMessages now holds a real value (even an empty
  // array counts as "finished" here - only "undefined", meaning the
  // request hasn't resolved yet, counts as "not restored").
  //
  // This is computed directly from restoreSessionUuid and restoredMessages
  // on every render, rather than stored in its own separate useState that
  // would need to be manually set to true at the right moment. There is
  // nothing else this value needs to track, so there is nothing that could
  // get out of sync by computing it this way.
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
