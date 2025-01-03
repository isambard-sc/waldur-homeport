export interface Attachment {
  created: string;
  file: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  thumbnail: string;
  issue: string;
  issue_key: string;
  url: string;
  uuid: string;
}

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
