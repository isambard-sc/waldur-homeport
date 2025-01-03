export interface Attachment {
  created: string;
  file: string | File;
  file_name: string;
  mime_type: string;
  file_size: number;
  thumbnail?: string;
}

export interface AttachmentUploading {
  key: string | number;
  file: File;
  progress: number;
  error?: any;
}
