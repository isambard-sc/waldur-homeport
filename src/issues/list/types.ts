export interface Issue {
  add_comment_is_available?: boolean;
  type: string;
  key: string;
  uuid: string;
  url?: string;
  link?: string;
  status?: string;
  description?: string;
  summary: string;
  caller_uuid: string;
  caller_full_name: string;
  customer_uuid: string;
  customer_name: string;
  created: string;
  modified: string;
}
