let activeSessionUuid: string | undefined;

/**
 * Returns the session UUID this browser tab is currently talking to.
 * Returns undefined if the user hasn't sent a message in this tab yet.
 *
 * This is stored in a plain variable in memory, not in sessionStorage.
 * That's enough to survive the user clicking to a different page in the
 * app and back (the component unmounts and remounts, but this value
 * doesn't reset) - it does not survive an actual browser reload, and
 * that's fine: after a reload there's no conversation to restore anyway,
 * so starting fresh is the correct behavior, not a bug.
 *
 * The anonymous chat feature (ai-assistant/anonymous/session.ts) makes the
 * same storage choice for its own session id, for the same reason.
 */
export const getActiveReportingSessionUuid = (): string | undefined =>
  activeSessionUuid;

export const setActiveReportingSessionUuid = (uuid: string): void => {
  activeSessionUuid = uuid;
};
