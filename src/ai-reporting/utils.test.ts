import { describe, it, expect, beforeEach } from 'vitest';

import { ENV } from '@/core/config';

import {
  getAIReportingFileRetentionDays,
  getAIReportingMode,
  isAIReportingAllowedForUser,
  isAIReportingEnabledForUser,
} from './utils';

const staff = { is_staff: true, is_support: false } as any;
const support = { is_staff: false, is_support: true } as any;
const regular = { is_staff: false, is_support: false } as any;

describe('AI reporting role gating', () => {
  beforeEach(() => {
    (ENV as any).plugins.WALDUR_CORE = {};
  });

  it('defaults to "staff_and_support" when the public config has no value at all, matching the backend Constance default', () => {
    expect(getAIReportingMode()).toBe('staff_and_support');
  });

  it('reads the configured mode from public config', () => {
    (ENV as any).plugins.WALDUR_CORE = { AI_REPORTING_ENABLED_ROLES: 'all' };
    expect(getAIReportingMode()).toBe('all');
  });

  it('"disabled" blocks every user, including staff', () => {
    expect(isAIReportingAllowedForUser(staff, 'disabled')).toBe(false);
  });

  it('"staff" allows only staff', () => {
    expect(isAIReportingAllowedForUser(staff, 'staff')).toBe(true);
    expect(isAIReportingAllowedForUser(support, 'staff')).toBe(false);
    expect(isAIReportingAllowedForUser(regular, 'staff')).toBe(false);
  });

  it('"staff_and_support" excludes regular users', () => {
    expect(isAIReportingAllowedForUser(staff, 'staff_and_support')).toBe(true);
    expect(isAIReportingAllowedForUser(support, 'staff_and_support')).toBe(
      true,
    );
    expect(isAIReportingAllowedForUser(regular, 'staff_and_support')).toBe(
      false,
    );
  });

  it('"all" allows everyone', () => {
    expect(isAIReportingAllowedForUser(regular, 'all')).toBe(true);
  });

  it('is false with no user at all, regardless of mode', () => {
    expect(isAIReportingAllowedForUser(undefined, 'all')).toBe(false);
  });

  it('isAIReportingEnabledForUser reads both the user and the mode from state', () => {
    (ENV as any).plugins.WALDUR_CORE = {
      AI_REPORTING_ENABLED: true,
      AI_REPORTING_ENABLED_ROLES: 'staff',
    };
    const state = { workspace: { user: staff } } as any;
    expect(isAIReportingEnabledForUser(state)).toBe(true);

    const otherState = { workspace: { user: regular } } as any;
    expect(isAIReportingEnabledForUser(otherState)).toBe(false);
  });

  it('isAIReportingEnabledForUser is false while the feature is off', () => {
    (ENV as any).plugins.WALDUR_CORE = {
      AI_REPORTING_ENABLED: false,
      AI_REPORTING_ENABLED_ROLES: 'all',
    };
    const state = { workspace: { user: staff } } as any;
    expect(isAIReportingEnabledForUser(state)).toBe(false);
  });
});

describe('getAIReportingFileRetentionDays', () => {
  beforeEach(() => {
    (ENV as any).plugins.WALDUR_CORE = {};
  });

  it('returns null when the public config has no value at all', () => {
    expect(getAIReportingFileRetentionDays()).toBeNull();
  });

  it('reads the configured number of days from public config', () => {
    (ENV as any).plugins.WALDUR_CORE = { AI_REPORTING_FILE_RETENTION_DAYS: 21 };
    expect(getAIReportingFileRetentionDays()).toBe(21);
  });

  it('returns null when retention is disabled (-1), rather than a negative day count', () => {
    (ENV as any).plugins.WALDUR_CORE = { AI_REPORTING_FILE_RETENTION_DAYS: -1 };
    expect(getAIReportingFileRetentionDays()).toBeNull();
  });
});
