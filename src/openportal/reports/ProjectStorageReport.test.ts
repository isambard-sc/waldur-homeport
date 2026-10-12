import { describe, expect, it } from 'vitest';

import { ProjectStorageReport } from './ProjectStorageReport';

const snapshot = (project: string, generated_at: string, usage: string) => ({
  project,
  generated_at,
  project_quotas: { home: { limit: '1024.00 GB', usage } },
  user_quotas: {
    [`chris.${project}`]: { home: { limit: 'unlimited', usage } },
  },
});

/** A cached monthly row: the newest snapshot on top, earlier ones daily. */
const row = (
  project: string,
  month: number,
  top: [string, string],
  earlier: Array<[string, string]> = [],
  resource = 'brics.aip1',
) =>
  ProjectStorageReport.fromApiResponse({
    id: month,
    year: 2026,
    month,
    project_identifier: project,
    resource,
    report: {
      ...snapshot(project, top[0], top[1]),
      users: { [`chris.${project}`]: 'chris' },
      ...(earlier.length > 0 && {
        daily_reports: Object.fromEntries(
          earlier.map(([at, usage]) => [
            at.slice(0, 10),
            snapshot(project, at, usage),
          ]),
        ),
      }),
    },
  } as any);

const homeUsage = (r: ProjectStorageReport) =>
  r.projectQuotas.home.usageFormatted;

describe('ProjectStorageReport series', () => {
  // The library keeps its newest snapshot out of daily_reports; a graph drawn
  // from daily_reports alone stopped a point short.
  it('includes the top-level snapshot as the last point', () => {
    const r = row(
      'p',
      8,
      ['2026-08-31T00:00:00Z', '30.00 GB'],
      [['2026-08-01T00:00:00Z', '10.00 GB']],
    );

    expect(r.dates).toEqual(['2026-08-01', '2026-08-31']);
    expect(r.getReport('2026-08-31').projectQuotas.home.usageFormatted).toBe(
      '30.00 GB',
    );
  });

  it('gives a single-snapshot report a one-point series', () => {
    expect(row('p', 8, ['2026-08-31T00:00:00Z', '30.00 GB']).dates).toEqual([
      '2026-08-31',
    ]);
  });
});

describe('ProjectStorageReport.combine', () => {
  // Storage is not additive over time: two months of one project are the
  // later month's snapshot, not the two added together.
  it('takes the latest snapshot across months of one project', () => {
    const july = row('p', 7, ['2026-07-31T00:00:00Z', '20.00 GB']);
    const august = row('p', 8, ['2026-08-31T00:00:00Z', '30.00 GB']);

    const combined = ProjectStorageReport.combine([august, july]);

    expect(homeUsage(combined)).toBe('30.00 GB');
    expect(combined.dates).toEqual(['2026-07-31', '2026-08-31']);
  });

  // Different projects hold different data at the same time, which does add.
  it('sums the latest snapshot of each project', () => {
    const combined = ProjectStorageReport.combine([
      row('a', 7, ['2026-07-31T00:00:00Z', '5.00 GB']),
      row('a', 8, ['2026-08-31T00:00:00Z', '10.00 GB']),
      row('b', 8, ['2026-08-31T00:00:00Z', '20.00 GB']),
    ]);

    expect(homeUsage(combined)).toBe('30.00 GB');
  });

  it('keeps each project and resource separate', () => {
    const combined = ProjectStorageReport.combine([
      row('a', 8, ['2026-08-31T00:00:00Z', '10.00 GB'], [], 'r1'),
      row('a', 8, ['2026-08-31T00:00:00Z', '20.00 GB'], [], 'r2'),
    ]);

    expect(homeUsage(combined)).toBe('30.00 GB');
    expect(combined.resource).toBe('r1, r2');
  });
});
