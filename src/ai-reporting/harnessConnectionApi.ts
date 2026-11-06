import { client } from 'waldur-js-client/client.gen';

// Mirrors waldur_mastermind.ai_reporting.serializers.HarnessConnectionSerializer.
// Not yet in the generated waldur-js-client - same situation as
// aiReportingApi.ts/reportingFilesApi.ts/usageStatsApi.ts, so this is a raw
// call through the same configured client instance.
export interface HarnessConnection {
  base_url: string;
  // The key itself is never returned by the API - only whether one is
  // currently stored, so the UI can show "Set"/"Not set" without ever
  // having the actual key pass through the browser once it's saved.
  signing_private_key_set: boolean;
  modified: string;
}

export interface PatchedHarnessConnectionRequest {
  base_url?: string;
  // Leave out to keep the currently stored key; send an empty string to
  // clear it (turning signing back off).
  signing_private_key?: string;
}

/** GET /api/ai-reporting-harness-connection/ */
export const fetchHarnessConnection = () =>
  client
    .get({ url: '/api/ai-reporting-harness-connection/' })
    .then((response) => response.data as HarnessConnection);

/** PATCH /api/ai-reporting-harness-connection/ */
export const updateHarnessConnection = (
  body: PatchedHarnessConnectionRequest,
) =>
  client
    .patch({ url: '/api/ai-reporting-harness-connection/', body })
    .then((response) => response.data as HarnessConnection);
