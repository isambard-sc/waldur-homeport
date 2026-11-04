import { client } from 'waldur-js-client/client.gen';

import { processApiResponse } from '@/table/api';
import { Fetcher, TableRequest } from '@/table/types';

// Mirrors waldur_mastermind.ai_reporting.serializers.ReportingFileListSerializer.
// Same situation as aiReportingApi.ts/usageStatsApi.ts - not yet in the
// generated waldur-js-client, so this is a raw call through the same
// configured client instance, with processApiResponse doing the same
// page/result-count/next-page parsing createFetcher would for a generated
// SDK function.
export interface ReportingFileListItem {
  uuid: string;
  name: string;
  // Absolute /api/media/<uuid>/ URL - see ReportingFileSerializer.
  file: string;
  created: string;
  // The question that produced this file - lets the Files page trace a
  // file back to its conversation without the user digging through chat
  // history themselves. The backend also returns `session`, but nothing
  // here reads it yet - add it back if a later feature needs it.
  prompt: string;
}

/** Fetcher for useTable - GET /api/ai-reporting-files/, newest first
 * (ReportingFileViewSet.get_queryset). */
export const fetchReportingFiles: Fetcher<ReportingFileListItem> = (
  request: TableRequest,
) =>
  client
    .get({
      url: '/api/ai-reporting-files/',
      query: {
        page: request.currentPage,
        page_size: request.pageSize,
        ...request.filter,
      },
    })
    .then((result) => processApiResponse<ReportingFileListItem>(result));

/** DELETE /api/ai-reporting-files/{uuid}/ - lets a user clear up a file
 * early, ahead of AI_REPORTING_FILE_RETENTION_DAYS' automatic cleanup. */
export const deleteReportingFile = (uuid: string) =>
  client.delete({
    url: '/api/ai-reporting-files/{uuid}/',
    path: { uuid },
  });
