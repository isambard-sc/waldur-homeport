import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { isStaffOrSupport } from '@/workspace/selectors';

import { isAIReportingEnabledForUser } from './utils';

// This component renders a row of tabs that switches between four pages:
// the chat tool itself, its usage dashboard, its file list, and its
// conversation history. Each page is its own ui-router state (see routes.ts)
// and has its own permission check:
//   - Chat, Files and History are shown if the current user passes the
//     admin-configurable AI_REPORTING_ENABLED_ROLES check (the same check
//     their routes use).
//   - Usage is shown only to staff or support, no matter what
//     AI_REPORTING_ENABLED_ROLES is set to (see routes.ts for why this one
//     case is kept separate).
//
// Each tab below is added to the list only if the current user passes that
// specific tab's own check. This matters for a concrete reason: if an admin
// sets AI_REPORTING_ENABLED_ROLES to "all", a regular (non-staff) user is
// now allowed to use Chat - but that same user is not staff or support, so
// they still need Files to show up in this nav for them too. An earlier
// version of this component hid the entire nav unless the user was staff
// or support, which broke exactly this case.
export const AIReportingNav: FC = () => {
  const router = useRouter();
  // useCurrentStateAndParams's return value isn't used here - just calling
  // it subscribes this component to route changes, so "active" below gets
  // re-evaluated (and the highlighted tab updates) every time the user
  // navigates. ReportingLayout.tsx calls this same hook for this same
  // reason.
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
  if (canUseTool) {
    items.push({
      key: 'reporting-ai-reporting-history',
      title: translate('History'),
      link: <Link state="reporting-ai-reporting-history" />,
      active: router.stateService.includes('reporting-ai-reporting-history'),
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
