import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { getEndDateStatus, getGracePeriodNotice } from './gracePeriodNotice';

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

// The three projects from 8 Oct 2026, each with a 30-day grace period.
describe('getEndDateStatus', () => {
  const TODAY = on('2026-10-08');
  const ended = (end: string, effective: string) =>
    getEndDateStatus(
      { end_date: end, effective_end_date: effective },
      30,
      TODAY,
    );

  it('counts to the last day of access in the grace period', () => {
    // Loses access 10 Oct, so 9 Oct is the last day: one day left.
    expect(ended('2026-09-10', '2026-10-10')).toEqual({
      kind: 'grace',
      daysLeft: 1,
    });
    // Loses access 9 Oct: today is the last day.
    expect(ended('2026-09-09', '2026-10-09')).toEqual({
      kind: 'grace',
      daysLeft: 0,
    });
  });

  // Access was lost at the start of 8 Oct, although the API still reports
  // is_in_grace_period that day: the label must not say "last day".
  it('is expired on the effective end date itself', () => {
    expect(ended('2026-09-08', '2026-10-08')).toEqual({
      kind: 'expired',
      daysAgo: 0,
    });
    expect(ended('2026-09-07', '2026-10-07')).toEqual({
      kind: 'expired',
      daysAgo: 1,
    });
  });

  it('is in the grace period from the end date itself', () => {
    expect(ended('2026-10-08', '2026-11-07')).toEqual({
      kind: 'grace',
      daysLeft: 29,
    });
  });

  it('counts down to an approaching end date', () => {
    // Ends 10 Oct, so 9 Oct is the last day.
    expect(ended('2026-10-10', '2026-11-09')).toEqual({
      kind: 'approaching',
      daysLeft: 1,
    });
    expect(ended('2027-01-01', '2027-01-31')).toBeNull();
  });

  // Without a grace period, access ends with the end date.
  it('expires on the end date when there is no grace period', () => {
    expect(ended('2026-10-08', '2026-10-08')).toEqual({
      kind: 'expired',
      daysAgo: 0,
    });
  });
});
