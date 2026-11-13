import { ENV } from '@/core/config';
import { type RootState } from '@/store/reducers';
import { User } from '@/workspace/types';

type AIReportingEnabledRoles =
  'disabled' | 'staff' | 'staff_and_support' | 'all';

/** AI_REPORTING_ENABLED_ROLES from public configuration. Falls back to
 * 'staff_and_support', the backend default, so the tab doesn't disappear
 * while the config is loading. */
export const getAIReportingMode = (): AIReportingEnabledRoles =>
  ENV.plugins?.WALDUR_CORE?.AI_REPORTING_ENABLED_ROLES ?? 'staff_and_support';

/** Same rules as the backend's permissions.check_enabled_roles. */
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
      // Fails closed on an unrecognised value, like the backend.
      return false;
  }
};

// Settings that are public but not yet in the generated CoreConfiguration
// type. Read them directly until waldur-js-client is regenerated.
const unlistedSetting = (key: string): unknown =>
  (
    ENV.plugins?.WALDUR_CORE as unknown as Record<string, unknown> | undefined
  )?.[key];

/** Whether AI reporting is on and the current user may use it. Takes the
 * Redux state, so routes.ts and tabs.ts can use it as a permission check. */
export const isAIReportingEnabledForUser = (state: RootState): boolean =>
  unlistedSetting('AI_REPORTING_ENABLED') === true &&
  isAIReportingAllowedForUser(state.workspace.user, getAIReportingMode());

/** AI_REPORTING_FILE_RETENTION_DAYS from public configuration, or null if
 * it hasn't loaded or retention is off (-1). */
export const getAIReportingFileRetentionDays = (): number | null => {
  const days = ENV.plugins?.WALDUR_CORE?.AI_REPORTING_FILE_RETENTION_DAYS;
  return typeof days === 'number' && days >= 0 ? days : null;
};

/** Same as getAIReportingFileRetentionDays, for messages. */
export const getAIReportingMessageRetentionDays = (): number | null => {
  const days = unlistedSetting('AI_REPORTING_MESSAGE_RETENTION_DAYS');
  return typeof days === 'number' && days >= 0 ? days : null;
};
