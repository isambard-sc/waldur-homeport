import { client } from 'waldur-js-client/client.gen';

import { processApiResponse } from '@/table/api';
import { Fetcher, TableRequest } from '@/table/types';

// Mirrors waldur_mastermind.ai_reporting.serializers.ReportingSessionSerializer.
// Same situation as reportingFilesApi.ts/aiReportingApi.ts - not yet in the
// generated waldur-js-client, so this is a raw call through the same
// configured client instance, with processApiResponse doing the same
// page/result-count/next-page parsing createFetcher would for a generated
// SDK function.
export interface ReportingSessionListItem {
  uuid: string;
  created: string;
  // Both annotated by the backend's queryset, not real model fields - see
  // ReportingSessionViewSet.get_queryset.
  last_activity: string;
  message_count: number;
  // The conversation's own opening question, as a stable label for it in
  // this list - see ReportingSessionSerializer.get_first_prompt.
  first_prompt: string;
}

/** Fetcher for useTable - GET /api/ai-reporting-sessions/, most recently
 * active first (ReportingSessionViewSet.get_queryset). */
export const fetchReportingSessions: Fetcher<ReportingSessionListItem> = (
  request: TableRequest,
) =>
  client
    .get<ReportingSessionListItem[]>({
      url: '/api/ai-reporting-sessions/',
      query: {
        page: request.currentPage,
        page_size: request.pageSize,
        ...request.filter,
      },
    })
    .then((result) => processApiResponse<ReportingSessionListItem[]>(result));
