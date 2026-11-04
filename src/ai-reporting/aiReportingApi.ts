import { client } from 'waldur-js-client/client.gen';

// Mirrors waldur_mastermind.ai_reporting.serializers.ReportingMessageSerializer.
// Not yet in published waldur-js-client exports - the ai_reporting app hasn't
// shipped a release with a regenerated client yet, so these are raw calls
// through the same configured client instance every generated function uses,
// instead of a typed wrapper. Replace with the generated equivalents once
// waldur-js-client picks up this endpoint.
export interface ReportingFile {
  uuid: string;
  name: string;
  // Absolute /api/media/<uuid>/ URL - see ReportingFileSerializer.
  file: string;
}

export interface ReportingMessage {
  uuid: string;
  session: string;
  prompt: string;
  answer: string;
  status: 'pending' | 'done' | 'failed';
  progress: string;
  new_files: string[];
  files: ReportingFile[];
  error_message: string;
  created: string;
}

export interface AskReportingQuestionRequest {
  prompt: string;
  session?: string;
  new_session?: boolean;
}

/** POST /api/ai-reporting-messages/ask/ */
export const askReportingQuestion = (body: AskReportingQuestionRequest) =>
  client
    .post({
      url: '/api/ai-reporting-messages/ask/',
      body,
    })
    .then((response) => response.data as ReportingMessage);

/** GET /api/ai-reporting-messages/{uuid}/ */
export const getReportingMessage = (uuid: string) =>
  client
    .get({
      url: '/api/ai-reporting-messages/{uuid}/',
      path: { uuid },
    })
    .then((response) => response.data as ReportingMessage);

/**
 * GET /api/ai-reporting-messages/?session={uuid} - one conversation's own
 * messages, oldest first (ReportingMessage.Meta.ordering). Used to restore
 * AIReportingPage's state when it remounts (e.g. after navigating away and
 * back) instead of starting from an empty page - see AIReportingPage.tsx.
 * page_size caps LinkHeaderPagination's default of 10, which a real
 * conversation can easily exceed; 300 is that paginator's own max.
 */
export const listReportingMessages = (session: string) =>
  client
    .get({
      url: '/api/ai-reporting-messages/',
      query: { session, page_size: 300 },
    })
    .then((response) => (response.data ?? []) as ReportingMessage[]);
