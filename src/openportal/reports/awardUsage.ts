/**
 * Usage and storage for the awards (remote projects) attached to a project.
 *
 * An award's usage must come from its own usage-report endpoint, never from
 * the raw monthly rows of `openportal-project-usage-reports`: those are keyed
 * by the identifier of whichever project held the award, so one award's
 * history is split across one key per project it has been on, and the month
 * it moved can be cached under both. The backend knows which key covered
 * which days and stitches them into one report. Storage is the same: its
 * rows are filed by project too, so it comes from the award's storage-report.
 */

import {
  type CachedProjectStorageReport,
  type CachedProjectUsageReport,
  type DailyStorageReport as SnapshotJson,
  type DailyProjectUsageReport as DailyJson,
  openportalRemoteProjectsList,
  openportalRemoteProjectsStorageReportRetrieve,
  openportalRemoteProjectsUsageReportRetrieve,
  type ProjectStorageReport as StorageJson,
  type ProjectUsageReport as ReportJson,
  type RemoteProject,
  type RemoteProjectUsageWindow,
} from 'waldur-js-client';

import { isNotFound } from '@/proposals/archive/resolveArchived';

import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';

export interface AwardUsage {
  remoteProject: RemoteProject;
  /** The award's report, one entry per calendar month it covers. */
  months: CachedProjectUsageReport[];
  /** The award's storage snapshots, as one row per calendar month. */
  storageMonths: CachedProjectStorageReport[];
  /** Which project held the award, when. Disjoint, oldest first. */
  windows: RemoteProjectUsageWindow[];
  totalHours: number;
}

/**
 * Splits one report spanning many months into one per calendar month.
 *
 * This only partitions the days of a single stitched report — every day lands
 * in exactly one month — so recombining the months gives back the original.
 * It exists so the month picker, which works on monthly rows, still works.
 */
export const splitByMonth = (
  report: ReportJson,
  resource: string,
): CachedProjectUsageReport[] => {
  const byMonth = new Map<string, Record<string, DailyJson>>();
  for (const [date, daily] of Object.entries(report.reports ?? {})) {
    const key = date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, {});
    byMonth.get(key)[date] = daily;
  }
  return [...byMonth.keys()].sort().map((key) => {
    const days = byMonth.get(key);
    const [year, month] = key.split('-').map(Number);
    return {
      id: 0,
      year,
      month,
      project_identifier: report.project,
      resource,
      is_complete: Object.values(days).every((daily) => daily.is_complete),
      report: { ...report, reports: days },
    };
  });
};

const storageSnapshots = (report: StorageJson): SnapshotJson[] => {
  const { daily_reports, users: _users, ...latest } = report;
  return [...Object.values(daily_reports ?? {}), latest]
    .filter((snapshot) => snapshot.generated_at)
    .sort((a, b) => a.generated_at.localeCompare(b.generated_at));
};

/**
 * One storage row holding the given snapshots: the newest at the top level —
 * what the bar chart reads as "current" — and all of them in `daily_reports`,
 * which is what the time series plots.
 */
const storageRow = (
  snapshots: SnapshotJson[],
  report: StorageJson,
  resource: string,
): CachedProjectStorageReport => {
  const newest = snapshots[snapshots.length - 1];
  const [year, month] = newest.generated_at.slice(0, 7).split('-').map(Number);
  return {
    id: 0,
    year,
    month,
    project_identifier: report.project,
    resource,
    report: {
      ...newest,
      users: report.users ?? {},
      daily_reports: Object.fromEntries(
        snapshots.map((s) => [s.generated_at.slice(0, 10), s]),
      ),
    },
  };
};

/**
 * The award's storage as one row per calendar month, for the month picker.
 *
 * Storage is snapshots, not amounts, so nothing here is added up: each row is
 * just the snapshots taken that month.
 */
export const splitStorageByMonth = (
  report: StorageJson,
  resource: string,
): CachedProjectStorageReport[] => {
  const byMonth = new Map<string, SnapshotJson[]>();
  for (const snapshot of storageSnapshots(report)) {
    const key = snapshot.generated_at.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(snapshot);
  }
  return [...byMonth.keys()]
    .sort()
    .map((key) => storageRow(byMonth.get(key), report, resource));
};

/**
 * The awards to report on for a project: one per destination, since a project
 * holds at most one award per cluster at a time.
 *
 * Only awards currently on this project are listed — the backend filters by
 * the award's current project, so history from an award that has since moved
 * away is not here.
 */
export const fetchProjectAwards = (
  projectUuid: string,
): Promise<RemoteProject[]> =>
  openportalRemoteProjectsList({ query: { project_uuid: projectUuid } }).then(
    (r) => (r.data ?? []).filter((rp) => rp.state !== 'deleted'),
  );

/**
 * One award's usage and storage, or null when the user cannot see it (404). A
 * pending award has no report yet and comes back with no months, which the
 * caller shows as "no usage yet" rather than as an error; so does an award
 * with no storage snapshots in range (`latest` is null).
 */
export const fetchAwardUsage = async (
  remoteProject: RemoteProject,
): Promise<AwardUsage | null> => {
  const path = { uuid: remoteProject.uuid };
  try {
    const [{ data: usage }, { data: storage }] = await Promise.all([
      openportalRemoteProjectsUsageReportRetrieve({ path }),
      openportalRemoteProjectsStorageReportRetrieve({ path }),
    ]);
    const report = usage?.report as ReportJson | null | undefined;
    const storageReport = storage?.latest ? storage.report : null;
    return {
      remoteProject,
      months: report ? splitByMonth(report, remoteProject.destination) : [],
      storageMonths: storageReport
        ? splitStorageByMonth(storageReport, remoteProject.destination)
        : [],
      windows: usage?.windows ?? [],
      totalHours: usage?.total_hours ?? 0,
    };
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const fetchAllAwardUsage = async (
  remoteProjects: RemoteProject[],
): Promise<AwardUsage[]> =>
  (await Promise.all(remoteProjects.map(fetchAwardUsage))).filter(Boolean);

export const awardUsageReports = (awards: AwardUsage[]): ProjectUsageReport[] =>
  awards.flatMap((award) =>
    award.months.map(ProjectUsageReport.fromApiResponse),
  );

export const awardStorageReports = (
  awards: AwardUsage[],
): ProjectStorageReport[] =>
  awards.flatMap((award) =>
    award.storageMonths.map(ProjectStorageReport.fromApiResponse),
  );
