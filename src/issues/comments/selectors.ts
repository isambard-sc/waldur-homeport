import { createSelector } from 'reselect';

import { type RootState } from '@waldur/store/reducers';

const getComments = (state: RootState) => state.issues.comments.items;
export const getIsDeleting = (state: RootState, props) =>
  !!state.issues.comments.deleting[props.comment.uuid];
export const getIsLoading = (state: RootState) => state.issues.comments.loading;
export const getIssue = (state: RootState) => state.issues.comments.issue;
export const getIsUiDisabled = (state: RootState) =>
  state.issues.comments.uiDisabled;
export const getUser = (state: RootState) => state.workspace.user;

export const getCommentsSelector = createSelector(getComments, (comments) =>
  [...comments].sort(
    (commentA, commentB) =>
      Date.parse(commentB.created) - Date.parse(commentA.created),
  ),
);
