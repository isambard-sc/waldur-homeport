import { client } from 'waldur-js-client/client.gen';

import { processApiResponse } from '@/table/api';
import { Fetcher, TableRequest } from '@/table/types';

// Mirrors ai_reporting's ReportingSessionSerializer. Raw calls until
// waldur-js-client includes these endpoints.
export interface ReportingSessionListItem {
  uuid: string;
  created: string;
  // Computed by the backend's queryset.
  last_activity: string;
  message_count: number;
  // The conversation's opening question, used as its label.
  first_prompt: string;
}

/** Fetcher for useTable - GET /api/ai-reporting-sessions/, most recently
 * active first. */
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
