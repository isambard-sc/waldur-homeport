export interface Issue {
  add_comment_is_available?: boolean;
  type: string;
  key: string;
  uuid: string;
  url?: string;
  link?: string;
  status?: string;
  priority: 'Medium' | 'High';
  description?: string;
  summary: string;
  caller_uuid: string;
  caller_full_name: string;
  assignee_name?: string;
  reporter_name?: string;
  customer_uuid: string;
  customer_name: string;
  project_uuid?: string;
  project_name?: string;
  resource?: string;
  resource_name?: string;
  resource_type?: string;
  resolution?: string;
  created: string;
  modified: string;
}
