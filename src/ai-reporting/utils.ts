import { ENV } from '@/core/config';
import { type RootState } from '@/store/reducers';
import { User } from '@/workspace/types';

type AIReportingEnabledRoles =
  'disabled' | 'staff' | 'staff_and_support' | 'all';

/** Read AI_REPORTING_ENABLED_ROLES from public configuration - same
 * mechanism as the AI assistant's own getLLMChatMode (see
 * ai-assistant/utils.ts), via the PUBLIC_CONSTANCE_SETTINGS allowlist on
 * the backend (constance_settings.py).
 *
 * Falls back to 'staff_and_support', not 'disabled': that's the backend's
 * own Constance default (constance_settings.py), chosen specifically to
 * preserve the route's pre-existing staff/support-only access until an
 * admin explicitly changes it. Defaulting to 'disabled' here would hide
 * the tab/route for staff during the brief window before the public
 * config blob loads, even though the backend would allow the request. */
export const getAIReportingMode = (): AIReportingEnabledRoles =>
  ENV.plugins?.WALDUR_CORE?.AI_REPORTING_ENABLED_ROLES ?? 'staff_and_support';

/** Mirrors the backend's permissions.check_enabled_roles exactly - no
 * "anonymous" branch here either, since ai_reporting has no
 * unauthenticated mode at all. */
export const isAIReportingAllowedForUser = (
  user: User | undefined,
  mode: AIReportingEnabledRoles | undefined,
): boolean => {
  if (!user || !mode) return false;
  switch (mode) {
    case 'disabled':
      return false;
    case 'staff':
      return user.is_staff;
    case 'staff_and_support':
      return user.is_staff || user.is_support;
    case 'all':
      return true;
    default:
      // Fails closed on an unrecognised value, matching the backend check -
      // see permissions.check_enabled_roles's own "configured incorrectly" branch.
      return false;
  }
};

/** Takes the whole Redux state and returns a boolean, exactly like
 * workspace/selectors' isStaffOrSupport does. That matters because
 * routes.ts's `permissions: [...]` list and tabs.ts's visibility check both
 * expect a function with this exact shape - so this function can be used
 * as a direct replacement for isStaffOrSupport in both places, swapping a
 * fixed staff/support check for one driven by the current
 * AI_REPORTING_ENABLED_ROLES value instead. */
// Settings that are public but not yet in the generated CoreConfiguration
// type. Read them directly until waldur-js-client is regenerated.
const unlistedSetting = (key: string): unknown =>
  (
    ENV.plugins?.WALDUR_CORE as unknown as Record<string, unknown> | undefined
  )?.[key];

export const isAIReportingEnabledForUser = (state: RootState): boolean =>
  unlistedSetting('AI_REPORTING_ENABLED') === true &&
  isAIReportingAllowedForUser(state.workspace.user, getAIReportingMode());

/** AI_REPORTING_FILE_RETENTION_DAYS from public configuration, for the
 * Files page's "deleted automatically after N days" line - same
 * PUBLIC_CONSTANCE_SETTINGS mechanism as getAIReportingMode above. null
 * when the key hasn't loaded yet (or retention is disabled, -1), so the
 * page can fall back to a generic line instead of claiming a number it
 * doesn't actually have. */
export const getAIReportingFileRetentionDays = (): number | null => {
  const days = ENV.plugins?.WALDUR_CORE?.AI_REPORTING_FILE_RETENTION_DAYS;
  return typeof days === 'number' && days >= 0 ? days : null;
};

/** AI_REPORTING_MESSAGE_RETENTION_DAYS from public configuration, for the
 * History tab's "deleted automatically after N days" line - same mechanism
 * as getAIReportingFileRetentionDays above. */
export const getAIReportingMessageRetentionDays = (): number | null => {
  const days = unlistedSetting('AI_REPORTING_MESSAGE_RETENTION_DAYS');
  return typeof days === 'number' && days >= 0 ? days : null;
};
