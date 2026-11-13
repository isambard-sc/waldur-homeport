let activeSessionUuid: string | undefined;

/** The session this browser tab is talking to, or undefined before its
 * first question. Kept in memory rather than sessionStorage, so it
 * survives navigating within the app but not a reload. */
export const getActiveReportingSessionUuid = (): string | undefined =>
  activeSessionUuid;

export const setActiveReportingSessionUuid = (uuid: string): void => {
  activeSessionUuid = uuid;
};
