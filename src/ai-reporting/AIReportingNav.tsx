import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { isStaffOrSupport } from '@/workspace/selectors';

import { isAIReportingEnabledForUser } from './utils';

// Switches between the tool itself, its usage dashboard and its file list,
// all reached as their own ui-router states (routes.ts) so each keeps its
// own permission gate - Chat/Files follow the admin-configurable
// AI_REPORTING_ENABLED_ROLES (same as their routes), while Usage stays
// staff/support-only regardless (see routes.ts's comment on that split).
// Each tab is shown only if its own gate actually passes - a user allowed
// onto Chat under AI_REPORTING_ENABLED_ROLES=all but who isn't staff/support
// still needs a working nav to reach Files, so the whole nav can't be
// hidden behind a single staff/support check the way it used to be.
export const AIReportingNav: FC = () => {
  const router = useRouter();
  // Subscribes to transitions, so the active tab re-renders on navigation -
  // same reasoning as ReportingLayout.tsx's own identical use of this hook.
  useCurrentStateAndParams();
  const canUseTool = useSelector(isAIReportingEnabledForUser);
  const isStaff = useSelector(isStaffOrSupport);

  if (!canUseTool && !isStaff) {
    return null;
  }

  const items = [];
  if (canUseTool) {
    items.push({
      key: 'reporting-ai-reporting',
      title: translate('Chat'),
      link: <Link state="reporting-ai-reporting" />,
      active: router.stateService.includes('reporting-ai-reporting'),
    });
  }
  if (isStaff) {
    items.push({
      key: 'reporting-ai-reporting-usage',
      title: translate('Usage'),
      link: <Link state="reporting-ai-reporting-usage" />,
      active: router.stateService.includes('reporting-ai-reporting-usage'),
    });
  }
  if (canUseTool) {
    items.push({
      key: 'reporting-ai-reporting-files',
      title: translate('Files'),
      link: <Link state="reporting-ai-reporting-files" />,
      active: router.stateService.includes('reporting-ai-reporting-files'),
    });
  }

  return <TabNav listClassName="mb-5" items={items} />;
};
