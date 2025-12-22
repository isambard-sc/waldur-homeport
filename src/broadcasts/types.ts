interface Message {
  subject: string;
  body: string;
}

export interface MessageTemplate extends Message {
  uuid: string;
}

export interface IdNamePair {
  name: string;
  uuid: string;
}

interface Broadcast extends Message {
  send_at: string;
}

export interface BroadcastFormData extends Broadcast {
  customers: IdNamePair[];
  offerings: IdNamePair[];
  all_users: boolean;
  round?: IdNamePair & { call_name?: string };
  proposal_states?: string[];
  include_reviewers?: boolean;
  send_to_me?: boolean;
  additional_recipients?: any[];
  excluded_recipients?: string[];
}

interface QueryRequest {
  customers: string[];
  offerings: string[];
  all_users: boolean;
  round?: string;
  proposal_states?: string[];
  include_reviewers?: boolean;
  send_to_me?: boolean;
  additional_recipients?: string[];
  excluded_recipients?: string[];
}

export interface BroadcastRequestData extends Broadcast {
  query: QueryRequest;
}
