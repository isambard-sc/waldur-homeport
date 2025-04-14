import { Attachment } from 'waldur-js-client';
export { Attachment } from 'waldur-js-client';

export type IssueAttachmentUploading = {
  key: string | number;
  file: File;
  progress: number;
  error?: any;
};

export interface IssueAttachmentState {
  loading: boolean;
  errors: any[];
  items: Attachment[];
  uploading: IssueAttachmentUploading[];
  deleting: { [key: string]: boolean };
  filter: string;
}

export interface Payload {
  loading?: boolean;
  error?: Response;
  items?: Attachment[];
  item?: Attachment;
  file?: File;
  uuid?: string;
  filter?: string;
  files?: File[];
  key?: string | number;
  progress?: number;
}
