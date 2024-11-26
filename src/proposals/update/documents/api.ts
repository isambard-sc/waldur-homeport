import { sendForm } from '@waldur/core/api';

export const attachDocuments = (call, file, description) =>
  sendForm('POST', `${call.url}attach_documents/`, {
    documents: file,
    description,
  });

export const detachDocuments = (call, file) =>
  sendForm('POST', `${call.url}detach_documents/`, { documents: file });
