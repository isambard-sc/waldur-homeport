import { ENV } from '@waldur/configs/default';
import { RootState } from '@waldur/store/reducers';

export const getAttachments = (state: RootState) =>
  state.issues.attachments.items;
export const getDeleting = (state: RootState) =>
  state.issues.attachments.deleting;
export const getIsDeleting = (state, { attachment }) =>
  !!state.issues.attachments.deleting[attachment.uuid];
export const getIsLoading = (state: RootState) =>
  state.issues.attachments.loading;
export const getUploading = (state: RootState) =>
  state.issues.attachments.uploading;
export const getExludedTypes = () => ENV.excludedAttachmentTypes;
