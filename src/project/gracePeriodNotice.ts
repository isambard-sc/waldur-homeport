import { DateTime } from 'luxon';
import { Project } from 'waldur-js-client';

/**
 * How many days before the data is scheduled for deletion a change to the
 * grace period must be requested. The deadline is inclusive: on the day itself
 * a request is still in time.
 *
 * Must match GRACE_CHANGE_NOTICE_DAYS in mastermind's
 * src/waldur_openportal/project_updates.py, which the grace period emails use:
 * the banner and the emails have to name the same dates.
 */
export const GRACE_CHANGE_NOTICE_DAYS = 10;

/**
 * Where a request for more time stands:
 * - `open`: still in time, until `contactBy`;
 * - `last-day`: today is `contactBy`, the last day a request is in time;
 * - `closed`: too late — the grace period can no longer be changed.
 */
export type GraceChangeWindow = 'open' | 'last-day' | 'closed';

export interface GracePeriodNotice {
  /** Last day of access to the data: the day before `graceEnd`. */
  lastAccessDay: DateTime;
  /** When access to the data is lost and it is scheduled for deletion. */
  graceEnd: DateTime;
  /** Last day, inclusive, to ask the allocator for an extension. */
  contactBy: DateTime;
  window: GraceChangeWindow;
}

/**
 * The grace period dates for a project, or null when it is not in one.
 *
 * Decided here rather than from `project.is_in_grace_period`. The backend
 * computes that as `end_date < today`, so on the end date itself the project
 * is reported as neither in its grace period nor expired, although access has
 * already ended — and the "grace period started" email goes out that day. End
 * dates are exclusive, so the grace period runs from the end date up to, not
 * including, the effective end date.
 *
 * `contactBy` is never moved: when the grace period is shorter than the notice
 * period it is already behind us, and the window is simply `closed`, which is
 * what the emails say too.
 */
export const getGracePeriodNotice = (
  project: Pick<Project, 'end_date' | 'effective_end_date'>,
  now: DateTime = DateTime.now(),
): GracePeriodNotice | null => {
  if (!project.end_date || !project.effective_end_date) {
    return null;
  }
  const today = now.startOf('day');
  const projectEnd = DateTime.fromISO(project.end_date).startOf('day');
  const graceEnd = DateTime.fromISO(project.effective_end_date).startOf('day');
  if (today < projectEnd || today >= graceEnd) {
    return null;
  }

  const contactBy = graceEnd.minus({ days: GRACE_CHANGE_NOTICE_DAYS });
  const window: GraceChangeWindow =
    today < contactBy
      ? 'open'
      : today.equals(contactBy)
        ? 'last-day'
        : 'closed';

  return {
    lastAccessDay: graceEnd.minus({ days: 1 }),
    graceEnd,
    contactBy,
    window,
  };
};
