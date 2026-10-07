import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getGracePeriodNotice } from './gracePeriodNotice';

// Ends 31 Dec 2026 with a 30-day grace period: the example the emails use.
const PROJECT = { end_date: '2026-12-31', effective_end_date: '2027-01-30' };

const on = (iso: string) => DateTime.fromISO(`${iso}T09:00:00`);
const day = (d: DateTime) => d.toISODate();

describe('getGracePeriodNotice', () => {
  it('names the same dates as the grace period emails', () => {
    const notice = getGracePeriodNotice(PROJECT, on('2027-01-05'));

    expect(day(notice.lastAccessDay)).toBe('2027-01-29');
    expect(day(notice.graceEnd)).toBe('2027-01-30');
    expect(day(notice.contactBy)).toBe('2027-01-20');
    expect(notice.window).toBe('open');
  });

  // The deadline is inclusive: on 20 January a request is still in time.
  it('keeps the window open on the last day', () => {
    expect(getGracePeriodNotice(PROJECT, on('2027-01-20')).window).toBe(
      'last-day',
    );
    expect(getGracePeriodNotice(PROJECT, on('2027-01-21')).window).toBe(
      'closed',
    );
  });

  // The API reports neither grace period nor expiry on the end date, but
  // access has ended and the email has gone out, so the notice shows.
  it('applies from the end date itself', () => {
    expect(getGracePeriodNotice(PROJECT, on('2026-12-30'))).toBeNull();
    expect(getGracePeriodNotice(PROJECT, on('2026-12-31'))).not.toBeNull();
  });

  it('ends when access is lost', () => {
    expect(getGracePeriodNotice(PROJECT, on('2027-01-29'))).not.toBeNull();
    expect(getGracePeriodNotice(PROJECT, on('2027-01-30'))).toBeNull();
  });

  // A grace period shorter than the notice period has its deadline in the
  // past from the start; it is closed, not moved to a later date.
  it('closes a grace period shorter than the notice period', () => {
    const notice = getGracePeriodNotice(
      { end_date: '2026-12-31', effective_end_date: '2027-01-05' },
      on('2026-12-31'),
    );

    expect(notice.window).toBe('closed');
    expect(day(notice.contactBy)).toBe('2026-12-26');
  });

  it('is null without both dates', () => {
    expect(
      getGracePeriodNotice({ end_date: null, effective_end_date: null }),
    ).toBeNull();
  });
});
