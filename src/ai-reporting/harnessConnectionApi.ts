import { client } from 'waldur-js-client/client.gen';

// Mirrors ai_reporting's HarnessConnectionSerializer. Raw calls until
// waldur-js-client includes this endpoint.
export interface HarnessConnection {
  base_url: string;
  // The key itself is never returned, only whether one is stored.
  signing_private_key_set: boolean;
  modified: string;
}

export interface PatchedHarnessConnectionRequest {
  base_url?: string;
  // Omit to keep the stored key; send an empty string to clear it.
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
