import { isStateVisible } from '@/core/stateVisibility';
import { isFeatureVisible } from '@/features/connect';
import { translate } from '@/i18n';
import { isStaffOrSupport } from '@/workspace/selectors';

import { getCategoryConfig, getVisibleReports } from './constants';

export interface ReportingTab {
  title: string;
  state: string;
}

/**
 * Tabs of the reporting section.
 *
 * A category tab is shown only when its target state is actually reachable.
 * The category flag and the flag on the category's route are not the same
 * flag — `proposals` is a category of call management but its route is gated
 * on experimental UI — so checking the category flag alone used to render a
 * tab that answered with the feature-disabled page on click. `isStateVisible`
 * reads the gate off the route itself, which is what the transition hook
 * enforces, so the two cannot drift apart again.
 *
 * The report list is filtered exactly as the category page filters it, so a
 * tab never leads to a page with no reports on it either.
 */
export const getReportingTabs = (workspace): ReportingTab[] => {
  const categories = getCategoryConfig();
  const tabs: ReportingTab[] = [
    { title: translate('Overview'), state: 'reporting-dashboard' },
  ];
  // Not a category (it's one tool, not a catalogue of reports), so it
  // bypasses the category loop below - but it needs the same staff/support
  // check those get, matching its route's own permissions (routes.ts) and
  // its backend (ai_reporting's ask_permissions). Without this, an
  // organisation owner - who can now reach /reporting/ at all - would see
  // this tab and then be blocked the moment they clicked it.
  if (isStaffOrSupport({ workspace } as any)) {
    tabs.push({ title: translate('AI reporting'), state: 'reporting-ai-reporting' });
  }

  Object.entries(categories).forEach(([key, category]) => {
    const state = `reporting-${key}-list`;
    if (!isStateVisible(state)) {
      return;
    }
    if (category.feature && !isFeatureVisible(category.feature)) {
      return;
    }
    if (category.permission && !category.permission({ workspace } as any)) {
      return;
    }
    if (getVisibleReports(category).length === 0) {
      return;
    }
    tabs.push({ title: category.title, state });
  });

  return tabs;
};
