import { client } from 'waldur-js-client/client.gen';

/**
 * Temporary hand-written bindings for backend endpoints that aren't in the
 * generated `waldur-js-client` package yet - the SDK's own source repo
 * (`js-client`) isn't set up locally (see docs/sdk.md), so these were added
 * to waldur-mastermind's OpenAPI schema but haven't flowed through codegen.
 *
 * Calling convention deliberately mirrors the generated sdk.gen.ts files
 * (same `client.get/post({url, path, query, body})` shape already used
 * for a hand-rolled call in `src/core/api.ts`'s `count()`), so this file
 * can be deleted with no other changes once the SDK is regenerated for
 * real and these functions/types are replaced by generated ones of the
 * same name and shape.
 */

export interface FormbricksStartFlowResponse {
  proposal_uuid: string;
  redirect_url: string;
}

export const proposalProposalsStartFormbricksFlow = (options: {
  body: { round_uuid: string };
}) =>
  client.post<FormbricksStartFlowResponse>({
    url: '/api/proposal-proposals/start-formbricks-flow/',
    body: options.body,
  });

export interface FormbricksProgressStep {
  key: string;
  redirect_url: string;
}

export interface FormbricksProgressResponse {
  completed_steps: string[];
  next_step: FormbricksProgressStep | null;
}

export const proposalProposalsFormbricksProgress = (options: {
  path: { uuid: string };
}) =>
  client.get<FormbricksProgressResponse>({
    url: '/api/proposal-proposals/{uuid}/formbricks-progress/',
    path: options.path,
  });

export interface FormbricksEditLinkResponse {
  redirect_url: string;
}

export const proposalProposalsFormbricksEditLink = (options: {
  path: { uuid: string };
  query: { step: string };
}) =>
  client.get<FormbricksEditLinkResponse>({
    url: '/api/proposal-proposals/{uuid}/formbricks-edit-link/',
    path: options.path,
    query: options.query,
  });

export interface FormResponseQuestion {
  question_id: string;
  label: string;
  answer: unknown;
}

export interface FormResponseGroup {
  step_key: string;
  questions: FormResponseQuestion[];
}
