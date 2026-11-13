import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { isStaffOrSupport } from '@/workspace/selectors';

import { isAIReportingEnabledForUser } from './utils';

// The Chat / History / Usage / Files tabs, each shown only if the user
// passes its own check. Usage is staff/support only; the others follow
// the AI reporting settings, so a regular user allowed to use Chat still
// gets the nav.
export const AIReportingNav: FC = () => {
  const router = useRouter();
  // Result unused - calling it re-renders on navigation, so the active tab
  // updates.
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
