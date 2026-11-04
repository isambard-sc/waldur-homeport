import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { isStaffOrSupport } from '@/workspace/selectors';

// Switches between the tool itself and its usage dashboard, both reached as
// their own ui-router states (routes.ts) so each keeps its own permission
// gate - the usage view stays staff/support-only regardless of
// AI_REPORTING_ENABLED_ROLES (see routes.ts's comment on that split). This
// nav just presents the two as one page instead of two unrelated top-level
// reporting tabs (see tabs.ts for why "AI reporting usage" was removed from
// the main Reporting tab row).
export const AIReportingNav: FC = () => {
  const router = useRouter();
  // Subscribes to transitions, so the active tab re-renders on navigation -
  // same reasoning as ReportingLayout.tsx's own identical use of this hook.
  useCurrentStateAndParams();
  const isStaff = useSelector(isStaffOrSupport);

  if (!isStaff) {
    return null;
  }

  return (
    <TabNav
      listClassName="mb-5"
      items={[
        {
          key: 'reporting-ai-reporting',
          title: translate('Chat'),
          link: <Link state="reporting-ai-reporting" />,
          active: router.stateService.includes('reporting-ai-reporting'),
        },
        {
          key: 'reporting-ai-reporting-usage',
          title: translate('Usage'),
          link: <Link state="reporting-ai-reporting-usage" />,
          active: router.stateService.includes('reporting-ai-reporting-usage'),
        },
      ]}
    />
  );
};
