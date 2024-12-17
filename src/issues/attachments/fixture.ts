import { Attachment, IssueAttachmentUploading } from './types';

export const attachment: Attachment = {
  created: '2018-01-11T19:41:50.451396Z',
  file_size: 64145,
  file: 'https://example.com/media/support_attachments/panda.jpg',
  file_name: 'panda.jpg',
  mime_type: 'image/jpg',
  thumbnail:
    'https://example.com/media/support_attachments_thumbnails/panda.jpg',
  issue:
    'https://example.com/api/support-issues/784fd0b3502849f6bd613d574e06b1e4/',
  issue_key: 'WAL-164',
  url: 'https://example.com/api/support-attachments/30a44649ee2d4a67ba1f17938a8a5f6e/',
  uuid: '30a44649ee2d4a67ba1f17938a8a5f6e',
};

export const attachmentUploading: IssueAttachmentUploading[] = [
  {
    file: new File([], 'file1.pdf'),
    key: 'file1.pdf',
    progress: 0,
    error: null,
  },
  {
    file: new File([], 'file2.png'),
    key: 'file2.png',
    progress: 0,
    error: null,
  },
];
