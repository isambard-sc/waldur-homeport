import { Issue } from '../list/types';

import * as constants from './constants';
import { Comment } from './types';

export const issueCommentsGet = (issueUrl: string) => ({
  type: constants.ISSUE_COMMENTS_GET,
  payload: {
    issueUrl,
  },
});

export const issueCommentsGetSuccess = (items: Comment[]) => ({
  type: constants.ISSUE_COMMENTS_GET_SUCCESS,
  payload: {
    items,
  },
});

export const issueCommentsGetError = (error: Response) => ({
  type: constants.ISSUE_COMMENTS_GET_ERROR,
  payload: {
    error,
  },
});

export const issueCommentsCreateSuccess = (item: Comment) => ({
  type: constants.ISSUE_COMMENTS_CREATE_SUCCESS,
  payload: {
    item,
  },
});

export const issueCommentsUpdateSuccess = (item: any) => ({
  type: constants.ISSUE_COMMENTS_UPDATE_SUCCESS,
  payload: {
    item,
  },
});

export const issueCommentsDelete = (commentId: string) => ({
  type: constants.ISSUE_COMMENTS_DELETE,
  payload: {
    commentId,
  },
});

export const issueCommentsDeleteSuccess = (commentId: string) => ({
  type: constants.ISSUE_COMMENTS_DELETE_SUCCESS,
  payload: {
    commentId,
  },
});

export const issueCommentsDeleteError = (
  error: Response,
  commentId: string,
) => ({
  type: constants.ISSUE_COMMENTS_DELETE_ERROR,
  payload: {
    error,
    commentId,
  },
});

export const issueCommentsIssueSet = (issue: Issue) => ({
  type: constants.ISSUE_COMMENTS_ISSUE_SET,
  payload: {
    issue,
  },
});
