import { getAll, post } from '@waldur/core/api';

import { IssueResponse } from './create/types';

interface IssueTemplateAttachment {
  name: string;
  field: string;
}

export interface IssueTemplate {
  name: string;
  description: string;
  issue_type: string;
  attachments: IssueTemplateAttachment[];
}

export const getTemplates = () => getAll<IssueTemplate>('/support-templates/');

export const createIssue = (payload) =>
  post<IssueResponse>('/support-issues/', payload).then(
    (response) => response.data,
  );
