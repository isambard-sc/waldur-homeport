import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { sendForm } from '@waldur/core/api';

import { Comment } from './types';

export const getComments = (issue: string) => {
  return Axios.get(`${ENV.apiEndpoint}api/support-comments/`, {
    params: {
      issue,
    },
  });
};

export const createComment = (description: string, issueUuid: string) => {
  return sendForm<Comment>(
    'POST',
    `${ENV.apiEndpoint}api/support-issues/${issueUuid}/comment/`,
    { is_public: true, description },
  );
};

export const updateComment = (description: string, uuid: string) => {
  return sendForm<Comment>(
    'PUT',
    `${ENV.apiEndpoint}api/support-comments/${uuid}/`,
    { is_public: true, description },
  );
};

export const deleteComment = (uuid: string) => {
  return Axios.delete(`${ENV.apiEndpoint}api/support-comments/${uuid}/`);
};
