import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { deleteById, sendForm } from '@waldur/core/api';

export const getAttachments = (issue: string) => {
  return Axios.get(`${ENV.apiEndpoint}api/support-attachments/`, {
    params: {
      issue,
    },
  });
};

export const putAttachment = (
  issueUrl: string,
  file: File,
  onUploadProgress?: (progress: number) => void,
) => {
  return sendForm(
    'POST',
    `${ENV.apiEndpoint}api/support-attachments/`,
    { issue: issueUrl, file },
    onUploadProgress,
  );
};

export const deleteAttachment = (uuid: string) => {
  return deleteById('/support-attachments/', uuid);
};
