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

const MAPPING_BATCH_SIZE = 25;

/** Number of batches that will be needed for `ids`. */
export const mappingBatchCount = (ids: string[]): number =>
  Math.ceil(ids.length / MAPPING_BATCH_SIZE);

export type MappingProgressCallback = (batchesDone: number) => void;

/**
 * Fetch an identifier→info mapping in batches of MAPPING_BATCH_SIZE.
 * Calls `onProgress(batchesDone)` after each batch so callers can track
 * progress. Batches are fetched sequentially to avoid overwhelming the server.
 */
async function fetchMappingBatched<T>(
  endpoint: string,
  identifiers: string[],
  onProgress?: MappingProgressCallback,
): Promise<Record<string, T>> {
  if (identifiers.length === 0) return {};
  const result: Record<string, T> = {};
  for (let i = 0; i < identifiers.length; i += MAPPING_BATCH_SIZE) {
    const chunk = identifiers.slice(i, i + MAPPING_BATCH_SIZE);
    const params = new URLSearchParams();
    for (const id of chunk) params.append('identifier', id);
    const data = await get<Record<string, T>>(`/openportal/${endpoint}/?${params}`);
    Object.assign(result, data);
    if (onProgress) onProgress(Math.floor(i / MAPPING_BATCH_SIZE) + 1);
  }
  return result;
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

export const fetchOfferingMapping = (ids: string[], onProgress?: MappingProgressCallback) =>
  fetchMappingBatched<OfferingInfo>('offering_mapping', ids, onProgress);
export const fetchProjectMapping = (ids: string[], onProgress?: MappingProgressCallback) =>
  fetchMappingBatched<ProjectInfo>('project_mapping', ids, onProgress);
export const fetchUserMapping = (ids: string[], onProgress?: MappingProgressCallback) =>
  fetchMappingBatched<UserInfo>('user_mapping', ids, onProgress);
