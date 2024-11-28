import { Issue } from '../list/types';

import { Comment } from './types';

export const comment: Comment = {
  author_name: 'author_name',
  author_user: 'author_user',
  author_uuid: 'author_uuid',
  author_email: 'author_emai',
  backend_id: 'backend_id',
  created: 'created',
  description: 'description',
  is_public: true,
  issue: 'issue',
  issue_key: 'issue_key',
  url: 'url',
  uuid: 'uuid',
  destroy_is_available: true,
  update_is_available: true,
};

export const issue: Partial<Issue> = {
  url: 'https://example.com/en-US/docs/Web/CSS/pointer-events',
};
