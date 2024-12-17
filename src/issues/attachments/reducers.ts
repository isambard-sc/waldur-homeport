import { Action } from '@waldur/core/reducerActions';

import * as constants from './constants';
import {
  Payload,
  IssueAttachmentState,
  IssueAttachmentUploading,
} from './types';

const INITIAL_STATE: IssueAttachmentState = {
  loading: false,
  errors: [],
  items: [],
  uploading: [],
  deleting: {},
  filter: constants.ISSUE_ATTACHMENTS_FILTER_NAMES.name,
};

export const reducer = (
  state: IssueAttachmentState = INITIAL_STATE,
  action: Action<Payload>,
): IssueAttachmentState => {
  const { type, payload } = action;
  switch (type) {
    case constants.ISSUE_ATTACHMENTS_GET:
      return {
        ...state,
        loading: true,
      };
    case constants.ISSUE_ATTACHMENTS_GET_SUCCESS:
      return {
        ...state,
        loading: false,
        items: payload.items,
      };
    case constants.ISSUE_ATTACHMENTS_GET_ERROR:
      return {
        ...state,
        errors: [...state.errors, payload.error],
        loading: false,
      };
    case constants.ISSUE_ATTACHMENTS_PUT_START:
      return {
        ...state,
        uploading: payload.files
          .map<IssueAttachmentUploading>((file) => ({
            // In order to locate the file, we use the file size as a key, because the file name will change on the backend.
            key: file.size,
            file,
            progress: 0,
          }))
          .concat(state.uploading),
      };
    case constants.ISSUE_ATTACHMENTS_PUT_SUCCESS:
      return {
        ...state,
        items: [payload.item, ...state.items],
        uploading: state.uploading.filter(
          (item) => payload.item.file_size !== item.key,
        ),
      };
    case constants.ISSUE_ATTACHMENTS_PUT_ERROR:
      return {
        ...state,
        errors: [...state.errors, payload.error],
        uploading: state.uploading.map((item) =>
          item.key === payload.file.size
            ? { ...item, error: payload.error, progress: 0 }
            : item,
        ),
      };
    case constants.ISSUE_ATTACHMENTS_PUT_REJECT:
      return {
        ...state,
        uploading: state.uploading.filter(
          (item) => item.key !== payload.file.size,
        ),
      };
    case constants.ISSUE_ATTACHMENTS_PUT_CANCEL:
      return {
        ...state,
        uploading: state.uploading.filter(
          (item) => item.key !== payload.file.size,
        ),
      };
    case constants.ISSUE_ATTACHMENTS_PUT_RETRY:
      return {
        ...state,
        uploading: state.uploading.map((item) =>
          item.key === payload.file.size
            ? { ...item, error: null, progress: 0 }
            : item,
        ),
      };
    case constants.ISSUE_ATTACHMENTS_PROGRESS_UPDATE: {
      const { key, progress } = payload;
      return {
        ...state,
        uploading: state.uploading.map((item) =>
          item.key === key ? { ...item, progress } : item,
        ),
      };
    }
    case constants.ISSUE_ATTACHMENTS_DELETE_START:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [payload.uuid]: true,
        },
      };
    case constants.ISSUE_ATTACHMENTS_DELETE_SUCCESS:
      return {
        ...state,
        items: state.items.filter((item) => item.uuid !== payload.uuid),
        deleting: {
          ...state.deleting,
          [payload.uuid]: null,
        },
      };
    case constants.ISSUE_ATTACHMENTS_DELETE_ERROR:
      return {
        ...state,
        deleting: {
          ...state.deleting,
          [payload.uuid]: false,
        },
        errors: [...state.errors, payload.error],
      };
    default:
      return state;
  }
};
