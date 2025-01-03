import { FunctionComponent } from 'react';

import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';

import { IssueAttachment } from './IssueAttachment';
import { IssueAttachmentPending } from './IssueAttachmentPending';
import { Attachment, IssueAttachmentUploading } from './types';

interface IssueAttachmentsListProps {
  attachments: Attachment[];
  uploading: IssueAttachmentUploading[];
}

export const IssueAttachmentsList: FunctionComponent<
  IssueAttachmentsListProps
> = ({ attachments, uploading }) => {
  return (
    <AttachmentsList
      attachments={attachments}
      uploading={uploading}
      ItemComponent={IssueAttachment}
      ItemPendingComponent={IssueAttachmentPending}
    />
  );
};
