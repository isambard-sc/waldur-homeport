import { Issue } from '../list/types';

export interface Comment {
  author_name: string;
  author_user: string;
  author_uuid: string;
  author_email: string;
  backend_id: string;
  created: string;
  description: string;
  is_public: boolean;
  issue: string;
  issue_key: string;
  url: string;
  uuid: string;
  update_is_available: boolean;
  destroy_is_available: boolean;
}

export interface IssueCommentState {
  loading: boolean;
  errors: any[];
  items: Comment[];
  deleting: { [key: string]: boolean };
  issue: Issue;
  uiDisabled: boolean;
  getErred: boolean;
}

export interface Payload {
  items?: Comment[];
  item?: Comment;
  loading?: boolean;
  error?: Response;
  formId?: string;
  commentId?: string;
  issue?: Issue;
  uiDisabled?: boolean;
  uuid: string;
  resolve(): void;
  reject(): void;
}
