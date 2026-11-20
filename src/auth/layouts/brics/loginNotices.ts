import {
  AdminAnnouncement,
  AdminAnnouncementTypeEnum,
  adminAnnouncementsList,
} from 'waldur-js-client';

/** How many notices the login page shows; the rest wait until after login. */
export const MAX_LOGIN_NOTICES = 3;

const SEVERITY: Record<AdminAnnouncementTypeEnum, number> = {
  danger: 0,
  warning: 1,
  information: 2,
};

/**
 * The notices worth showing before login: the most severe first, then the
 * newest, so an outage is never pushed off the page by routine news.
 */
export const selectLoginNotices = (
  announcements: AdminAnnouncement[],
): AdminAnnouncement[] =>
  announcements
    .filter((announcement) => announcement.description?.trim())
    .sort(
      (a, b) =>
        SEVERITY[a.type ?? 'information'] - SEVERITY[b.type ?? 'information'] ||
        b.active_from.localeCompare(a.active_from),
    )
    .slice(0, MAX_LOGIN_NOTICES);

/**
 * Active admin announcements, as staff publish them under Administration →
 * Announcements. The endpoint is readable without logging in, and the backend
 * filters on the active window, so a notice appears and expires on its own.
 */
export const fetchLoginNotices = () =>
  adminAnnouncementsList({
    query: { is_active: true, page_size: 20 },
  }).then(({ data }) => selectLoginNotices(data ?? []));
