import { Settings } from 'luxon';
import { afterEach, describe, expect, it } from 'vitest';

import { formatDateTimeWithZone, formatZoneOffset } from './dateUtils';

describe('formatDateTimeWithZone', () => {
  const defaultZone = Settings.defaultZone;
  const defaultLocale = Settings.defaultLocale;
  afterEach(() => {
    Settings.defaultZone = defaultZone;
    Settings.defaultLocale = defaultLocale;
  });

  it("gives the time in the viewer's zone, and which zone", () => {
    Settings.defaultZone = 'Asia/Bangkok';
    Settings.defaultLocale = 'en-GB';
    expect(formatDateTimeWithZone('2026-11-13T10:00:00Z')).toBe(
      '13 Nov 2026, 17:00 (GMT+7)',
    );
  });

  it('names half-hour offsets and plain GMT', () => {
    Settings.defaultZone = 'Asia/Kolkata';
    expect(formatZoneOffset('2026-11-13T10:00:00Z')).toBe('GMT+5:30');
    Settings.defaultZone = 'Europe/London';
    expect(formatZoneOffset('2026-11-13T10:00:00Z')).toBe('GMT');
    expect(formatZoneOffset('2026-07-13T10:00:00Z')).toBe('GMT+1');
  });
});
