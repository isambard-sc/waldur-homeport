import { Action } from '@waldur/core/reducerActions';
import { omit } from '@waldur/core/utils';

import * as constants from './constants';
import { Payload, IssueCommentState } from './types';

const INITIAL_STATE: IssueCommentState = {
  loading: false,
  errors: [],
  items: [],
  deleting: {},
  issue: null,
  uiDisabled: false,
  getErred: false,
};

export const reducer = (
  state: IssueCommentState = INITIAL_STATE,
  action: Action<Payload>,
): IssueCommentState => {
  const { type, payload } = action;
  switch (type) {
    case constants.ISSUE_COMMENTS_GET:
      return {
        ...state,
        loading: true,
      };
    case constants.ISSUE_COMMENTS_GET_SUCCESS:
      return {
        ...state,
        loading: false,
        getErred: false,
        items: payload.items,
      };
    case constants.ISSUE_COMMENTS_GET_ERROR:
      return {
        ...state,
        loading: false,
        getErred: true,
        errors: [...state.errors, payload.error],
      };
    case constants.ISSUE_COMMENTS_CREATE_SUCCESS:
      return {
        ...state,
        items: [payload.item, ...state.items],
      };
    case constants.ISSUE_COMMENTS_UPDATE_SUCCESS:
      return {
        ...state,
        items: state.items.map((item) =>
          item.uuid === payload.item.uuid ? payload.item : item,
        ),
      };
    case constants.ISSUE_COMMENTS_DELETE:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [payload.commentId]: true,
        },
      };
    case constants.ISSUE_COMMENTS_DELETE_SUCCESS:
      return {
        ...state,
        deleting: omit(state.deleting, payload.commentId),
        items: state.items.filter((item) => item.uuid !== payload.commentId),
      };
    case constants.ISSUE_COMMENTS_DELETE_ERROR:
      return {
        ...state,
        deleting: omit(state.deleting, payload.commentId),
        errors: [...state.errors, payload.error],
      };
    case constants.ISSUE_COMMENTS_ISSUE_SET:
      return {
        ...state,
        issue: payload.issue,
      };
    default:
      return state;
  }
};
