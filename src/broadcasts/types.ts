import { IdNamePair, ProposalStatesEnum } from 'waldur-js-client';

interface Message {
  subject: string;
  body: string;
}

export interface MessageTemplate extends Message {
  uuid: string;
}

export type { IdNamePair };

interface Broadcast extends Message {
  send_at: string;
}

export interface BroadcastFormData extends Broadcast {
  customers: IdNamePair[];
  offerings: IdNamePair[];
  all_users: boolean;
  /** Only picks the rounds offered; not sent. */
  round_call?: IdNamePair | null;
  rounds?: IdNamePair[];
  proposal_states?: ProposalStatesEnum[];
  proposal_teams?: boolean;
  reviewers?: boolean;
  action?: 'draft' | 'submit';
}

interface QueryRequest {
  customers: string[];
  offerings: string[];
  all_users: boolean;
  rounds?: string[];
  proposal_states?: ProposalStatesEnum[];
  proposal_teams?: boolean;
  reviewers?: boolean;
}

export interface BroadcastRequestData extends Broadcast {
  query: QueryRequest;
}
