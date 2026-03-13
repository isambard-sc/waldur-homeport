/**
 * Fetch helpers for the two cached OpenPortal report endpoints.
 *
 * Data is fetched once and returned as wrapper class instances.
 * All subsequent filtering/aggregation is done client-side via the class
 * methods — no re-fetching occurs.
 */

import { get } from '@waldur/core/api';

import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import {
  StorageReportApiItem,
  StorageReportFilters,
  UsageReportApiItem,
  UsageReportFilters,
} from './types';

function buildQuery(filters: object): string {
  const params = new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );
  const s = params.toString();
  return s ? `?${s}` : '';
}

/**
 * Fetch cached usage reports matching the given filters.
 * Returns one ProjectUsageReport per API envelope item.
 * Use ProjectUsageReport.combine() to merge them if needed.
 */
export const fetchUsageReports = async (
  filters: UsageReportFilters = {},
): Promise<ProjectUsageReport[]> => {
  const items = await get<UsageReportApiItem[]>(
    `/openportal-project-usage-reports/${buildQuery(filters)}`,
  );
  return items.map(ProjectUsageReport.fromApiResponse);
};

/**
 * Fetch cached storage reports matching the given filters.
 * Returns one ProjectStorageReport per API envelope item.
 * Use ProjectStorageReport.combine() to merge them if needed.
 */
export const fetchStorageReports = async (
  filters: StorageReportFilters = {},
): Promise<ProjectStorageReport[]> => {
  const items = await get<StorageReportApiItem[]>(
    `/openportal-project-storage-reports/${buildQuery(filters)}`,
  );
  return items.map(ProjectStorageReport.fromApiResponse);
};
