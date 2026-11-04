let activeSessionUuid: string | undefined;

/**
 * The AI reporting session this tab was last talking to, if any - plain
 * module state (not sessionStorage), so it survives navigating away from
 * AIReportingPage and back within the same page load, the same "lives for
 * as long as the page does" choice ai-assistant/anonymous/session.ts makes
 * for its own session id. A real page reload clears it, same as that one -
 * on return there's simply nothing to restore, rather than a conversation
 * kept alive indefinitely.
 */
export const getActiveReportingSessionUuid = (): string | undefined =>
  activeSessionUuid;

export const setActiveReportingSessionUuid = (uuid: string): void => {
  activeSessionUuid = uuid;
};
