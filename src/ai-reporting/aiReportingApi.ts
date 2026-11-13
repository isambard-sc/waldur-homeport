import { client } from 'waldur-js-client/client.gen';

// Mirrors ai_reporting's ReportingMessageSerializer. Raw calls until
// waldur-js-client includes these endpoints.
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

/** GET /api/ai-reporting-messages/?session={uuid} - one conversation's
 * messages, oldest first. 300 is the paginator's maximum page size. */
export const listReportingMessages = (session: string) =>
  client
    .get({
      url: '/api/ai-reporting-messages/',
      query: { session, page_size: 300 },
    })
    .then((response) => (response.data ?? []) as ReportingMessage[]);
