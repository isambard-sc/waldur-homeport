import { ReactNode } from 'react';

import { Customer, Project } from '@waldur/workspace/types';

export interface IssueFormData {
  type: any;
  summary: string;
  description: string;
  template: any;
  files: FileList;
  issueTemplate?: any;
  customer?: Customer;
  project?: Project;
  resource?: any;
}

export interface IssueRequestPayload {
  type: string;
  summary: string;
  description: string;
  is_reported_manually?: boolean;
  customer?: string;
  project?: string;
  resource?: string;
  template?: string;
  caller?: string;
  assignee?: string;
  priority?: string;
}

export interface IssueResponse {
  url: string;
  key: string;
  uuid: string;
}

export interface IssueTypeOption {
  iconNode: ReactNode;
  label: string;
  description: string;
  id: string;
}
