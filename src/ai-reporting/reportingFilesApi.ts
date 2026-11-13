import { client } from 'waldur-js-client/client.gen';

import { processApiResponse } from '@/table/api';
import { Fetcher, TableRequest } from '@/table/types';

// Mirrors ai_reporting's ReportingFileListSerializer. Raw calls until
// waldur-js-client includes these endpoints.
export interface ReportingFileListItem {
  uuid: string;
  name: string;
  // Absolute /api/media/<uuid>/ URL - see ReportingFileSerializer.
  file: string;
  created: string;
  // The question that produced the file.
  prompt: string;
}

/** Fetcher for useTable - GET /api/ai-reporting-files/, newest first. */
export const fetchReportingFiles: Fetcher<ReportingFileListItem> = (
  request: TableRequest,
) =>
  client
    .get<ReportingFileListItem[]>({
      url: '/api/ai-reporting-files/',
      query: {
        page: request.currentPage,
        page_size: request.pageSize,
        ...request.filter,
      },
    })
    .then((result) => processApiResponse<ReportingFileListItem[]>(result));

/** DELETE /api/ai-reporting-files/{uuid}/ */
export const deleteReportingFile = (uuid: string) =>
  client.delete({
    url: '/api/ai-reporting-files/{uuid}/',
    path: { uuid },
  });
