import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { AdminAnnouncement } from 'waldur-js-client';

import { ANNOUNCEMENT_ICON } from '@/administration/utils';
import { STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { parseMarkdownLinksOnly } from '@/core/sanitize';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { fetchLoginNotices } from './loginNotices';

const AnnouncementDetailsDialog = lazyComponent(() =>
  import('@/navigation/header/announcements/AnnouncementDetailsDialog').then(
    (module) => ({ default: module.AnnouncementDetailsDialog }),
  ),
);

const LoginNotice = ({
  announcement,
  onShowMore,
}: {
  announcement: AdminAnnouncement;
  onShowMore(announcement: AdminAnnouncement): void;
}) => {
  const type = announcement.type ?? 'information';
  const Icon = ANNOUNCEMENT_ICON[type].icon;
  const html = useMemo(
    () => parseMarkdownLinksOnly(announcement.description),
    [announcement.description],
  );
  return (
    <li className={`brics-notice brics-notice-${type}`}>
      <Icon weight="bold" className="brics-notice-icon" aria-hidden />
      <div className="brics-notice-body">
        <div
          className="brics-notice-text"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <button
          type="button"
          className="brics-notice-more"
          onClick={() => onShowMore(announcement)}
        >
          {translate('Read more')}
        </button>
      </div>
    </li>
  );
};

/**
 * Service status and news, from the admin announcements. Nothing is shown
 * while loading, when there is nothing current, or when the request fails:
 * the notices are a courtesy, and must never get in the way of logging in.
 */
export const LoginNotices = () => {
  const { data } = useQuery({
    queryKey: ['LoginNotices'],
    queryFn: fetchLoginNotices,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    meta: { skipGlobalErrorRedirect: true },
  });

  const { openDialog } = useModal();
  const showMore = useCallback(
    (announcement: AdminAnnouncement) =>
      openDialog(AnnouncementDetailsDialog, {
        resolve: { announcement },
        size: 'lg',
      }),
    [openDialog],
  );

  if (!data?.length) {
    return null;
  }

  return (
    <section
      className="brics-notices"
      aria-label={translate('Service status and news')}
    >
      <h2 className="brics-section-title">
        {translate('Service status and news')}
      </h2>
      <ul>
        {data.map((announcement) => (
          <LoginNotice
            key={announcement.uuid}
            announcement={announcement}
            onShowMore={showMore}
          />
        ))}
      </ul>
    </section>
  );
};
