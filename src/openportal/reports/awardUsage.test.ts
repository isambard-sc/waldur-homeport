import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openportalRemoteProjectsStorageReportRetrieve,
  openportalRemoteProjectsUsageReportRetrieve,
  type RemoteProject,
} from 'waldur-js-client';

import {
  awardStorageReports,
  awardUsageReports,
  fetchAwardUsage,
  splitByMonth,
  splitStorageByMonth,
} from './awardUsage';
import { ProjectUsageReport } from './ProjectUsageReport';

const day = (seconds: number, is_complete = true) => ({
  is_complete,
  reports: { 'chris.aiproject': { seconds } },
});

const REPORT: any = {
  project: 'aiproject.brics',
  users: { 'chris.aiproject.brics': 'chris.aiproject' },
  reports: {
    '2026-07-30': day(3600),
    '2026-07-31': day(7200),
    '2026-08-01': day(3600, false),
  },
};

const award = { uuid: 'rp1', destination: 'airr.brics' } as RemoteProject;

describe('splitByMonth', () => {
  it('partitions the days into calendar months', () => {
    const months = splitByMonth(REPORT, 'airr.brics');

    expect(months.map((m) => [m.year, m.month])).toEqual([
      [2026, 7],
      [2026, 8],
    ]);
    expect(Object.keys(months[0].report.reports)).toEqual([
      '2026-07-30',
      '2026-07-31',
    ]);
    expect(months[0].is_complete).toBe(true);
    expect(months[1].is_complete).toBe(false);
    expect(months.every((m) => m.resource === 'airr.brics')).toBe(true);
  });

  // Splitting only partitions one stitched report, so nothing is counted twice.
  it('recombines to the original total', () => {
    const reports = splitByMonth(REPORT, 'airr.brics').map(
      ProjectUsageReport.fromApiResponse,
    );

    expect(ProjectUsageReport.combine(reports).totalUsageHours()).toBe(4);
  });
});

const snapshot = (generated_at: string, usage: string) => ({
  project: 'award.brics',
  generated_at,
  project_quotas: { home: { limit: '1024.00 GB', usage } },
  user_quotas: {},
});

// The newest snapshot is the top level; only earlier ones are daily_reports.
const STORAGE: any = {
  ...snapshot('2026-08-02T00:00:00Z', '30.00 GB'),
  users: { 'chris.award.brics': 'chris.award' },
  daily_reports: {
    '2026-07-30': snapshot('2026-07-30T00:00:00Z', '10.00 GB'),
    '2026-07-31': snapshot('2026-07-31T00:00:00Z', '20.00 GB'),
    '2026-08-01': snapshot('2026-08-01T00:00:00Z', '25.00 GB'),
  },
};

describe('splitStorageByMonth', () => {
  it("gives each month its newest snapshot and all of that month's days", () => {
    const months = splitStorageByMonth(STORAGE, 'airr.brics');

    expect(months.map((m) => [m.year, m.month])).toEqual([
      [2026, 7],
      [2026, 8],
    ]);
    expect(months[0].report.project_quotas.home.usage).toBe('20.00 GB');
    expect(Object.keys(months[0].report.daily_reports)).toEqual([
      '2026-07-30',
      '2026-07-31',
    ]);
    expect(months[1].report.project_quotas.home.usage).toBe('30.00 GB');
    expect(months[1].report.users).toEqual(STORAGE.users);
  });

  // The award's report keeps its newest snapshot out of daily_reports; the
  // series has to put it back or the graph stops a point short.
  it('puts the newest snapshot into the series', () => {
    const months = splitStorageByMonth(STORAGE, 'airr.brics');

    expect(Object.keys(months[1].report.daily_reports)).toEqual([
      '2026-08-01',
      '2026-08-02',
    ]);
  });

  it('handles a single snapshot with no daily_reports', () => {
    const { daily_reports: _, ...single } = STORAGE;
    const months = splitStorageByMonth(single, 'airr.brics');

    expect(months).toHaveLength(1);
    expect(Object.keys(months[0].report.daily_reports)).toEqual(['2026-08-02']);
  });
});

describe('fetchAwardUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(openportalRemoteProjectsStorageReportRetrieve).mockResolvedValue({
      data: { latest: null, report: null, windows: [] },
    } as any);
  });

  it('includes the storage snapshots', async () => {
    vi.mocked(openportalRemoteProjectsUsageReportRetrieve).mockResolvedValue({
      data: { total_hours: 0, report: null, windows: [] },
    } as any);
    vi.mocked(openportalRemoteProjectsStorageReportRetrieve).mockResolvedValue({
      data: { latest: '2026-08-02T00:00:00Z', report: STORAGE, windows: [] },
    } as any);

    const usage = await fetchAwardUsage(award);

    expect(usage.storageMonths).toHaveLength(2);
    expect(awardStorageReports([usage])).toHaveLength(2);
  });

  // An empty report with no snapshots in range is "no storage yet".
  it('gives an award with no snapshots no storage', async () => {
    vi.mocked(openportalRemoteProjectsUsageReportRetrieve).mockResolvedValue({
      data: { total_hours: 0, report: null, windows: [] },
    } as any);
    vi.mocked(openportalRemoteProjectsStorageReportRetrieve).mockResolvedValue({
      data: {
        latest: null,
        report: { ...snapshot('', ''), users: {} },
        windows: [],
      },
    } as any);

    expect((await fetchAwardUsage(award)).storageMonths).toEqual([]);
  });

  it('returns the months and windows of the stitched report', async () => {
    vi.mocked(openportalRemoteProjectsUsageReportRetrieve).mockResolvedValue({
      data: {
        start: '2026-07-01',
        end: '2026-08-01',
        total_hours: 4,
        report: REPORT,
        windows: [
          {
            project_uuid: 'p1',
            project_name: 'One',
            start: '2026-07-01',
            end: null,
            project_identifier: 'one.brics',
          },
        ],
      },
    } as any);

    const usage = await fetchAwardUsage(award);

    expect(usage.totalHours).toBe(4);
    expect(usage.windows).toHaveLength(1);
    expect(awardUsageReports([usage])).toHaveLength(2);
  });

  // Not approved yet: no report, which is "no usage yet" rather than an error.
  it('gives a pending award no months', async () => {
    vi.mocked(openportalRemoteProjectsUsageReportRetrieve).mockResolvedValue({
      data: {
        start: null,
        end: null,
        total_hours: 0,
        report: null,
        windows: [],
      },
    } as any);

    expect((await fetchAwardUsage(award)).months).toEqual([]);
  });

  it('treats a 404 as not visible', async () => {
    vi.mocked(openportalRemoteProjectsUsageReportRetrieve).mockRejectedValue({
      response: { status: 404 },
    });

    expect(await fetchAwardUsage(award)).toBeNull();
  });

  it('lets any other error through', async () => {
    vi.mocked(openportalRemoteProjectsUsageReportRetrieve).mockRejectedValue({
      response: { status: 500 },
    });

    await expect(fetchAwardUsage(award)).rejects.toEqual({
      response: { status: 500 },
    });
  });
});
