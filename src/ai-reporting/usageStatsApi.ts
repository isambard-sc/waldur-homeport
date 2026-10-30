import { client } from 'waldur-js-client/client.gen';

// Mirrors waldur_mastermind.ai_reporting.serializers.UsageStatsResponseSerializer.
// Same situation as aiReportingApi.ts - not yet in the generated waldur-js-client,
// so this is a raw call through the same configured client instance.
export interface DailyUsage {
  date: string;
  input_tokens: number;
  output_tokens: number;
  requests: number;
}

export interface UserUsage {
  user: string;
  full_name: string;
  username: string;
  input_tokens: number;
  output_tokens: number;
  requests: number;
}

export interface UsageStatsResponse {
  period_days: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_requests: number;
  daily: DailyUsage[];
  by_user: UserUsage[];
}

/** GET /api/ai-reporting-messages/usage_stats/ */
export const getUsageStats = (days: number) =>
  client
    .get({
      url: '/api/ai-reporting-messages/usage_stats/',
      query: { days },
    })
    .then((response) => response.data as UsageStatsResponse);
