/**
 * Fetch helpers for the two cached OpenPortal report endpoints.
 *
 * Data is fetched once and returned as wrapper class instances.
 * All subsequent filtering/aggregation is done client-side via the class
 * methods — no re-fetching occurs.
 */

import { get, getAll, getAllWithProgress } from '@waldur/core/api';

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
type ProgressCallback = (page: number, totalPages: number | undefined) => void;

export const fetchUsageReports = async (
  filters: UsageReportFilters = {},
  onProgress?: ProgressCallback,
): Promise<ProjectUsageReport[]> => {
  const endpoint = `/openportal-project-usage-reports/${buildQuery(filters)}`;
  const items = onProgress
    ? await getAllWithProgress<UsageReportApiItem>(endpoint, onProgress)
    : await getAll<UsageReportApiItem>(endpoint);
  return items.map(ProjectUsageReport.fromApiResponse);
};

/**
 * Fetch cached storage reports matching the given filters.
 * Returns one ProjectStorageReport per API envelope item.
 * Use ProjectStorageReport.combine() to merge them if needed.
 */
export const fetchStorageReports = async (
  filters: StorageReportFilters = {},
  onProgress?: ProgressCallback,
): Promise<ProjectStorageReport[]> => {
  const endpoint = `/openportal-project-storage-reports/${buildQuery(filters)}`;
  const items = onProgress
    ? await getAllWithProgress<StorageReportApiItem>(endpoint, onProgress)
    : await getAll<StorageReportApiItem>(endpoint);
  return items.map(ProjectStorageReport.fromApiResponse);
};

// ── Identifier → name mapping endpoints ──────────────────────────────────────

async function fetchMapping<T>(
  endpoint: string,
  identifiers: string[],
): Promise<Record<string, T>> {
  if (identifiers.length === 0) return {};
  const params = new URLSearchParams();
  for (const id of identifiers) params.append('identifier', id);
  return get<Record<string, T>>(`/openportal/${endpoint}/?${params}`);
}

export interface OfferingInfo {
  uuid: string;
  name: string;
  description: string;
  slug: string;
}
export interface ProjectInfo {
  uuid: string;
  name: string;
  customer_uuid: string;
  customer_name: string;
}
export interface UserInfo {
  uuid: string;
  full_name: string;
  username: string;
  email: string;
}

export const fetchOfferingMapping = (ids: string[]) =>
  fetchMapping<OfferingInfo>('offering_mapping', ids);
export const fetchProjectMapping = (ids: string[]) =>
  fetchMapping<ProjectInfo>('project_mapping', ids);
export const fetchUserMapping = (ids: string[]) =>
  fetchMapping<UserInfo>('user_mapping', ids);
