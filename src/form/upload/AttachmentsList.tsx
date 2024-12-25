import { ComponentType, FC } from 'react';

import { Attachment, AttachmentUploading } from './types';

import './AttachmentsList.scss';

interface AttachmentsListProps {
  attachments: Attachment[];
  uploading: AttachmentUploading[];
  ItemComponent: ComponentType<{ attachment }>;
  ItemPendingComponent: ComponentType<{ file; progress; error }>;
  className?: string;
}

export const AttachmentsList: FC<AttachmentsListProps> = ({
  attachments,
  uploading,
  ItemComponent,
  ItemPendingComponent,
  className,
}) => {
  return attachments.length > 0 || uploading.length > 0 ? (
    <ul className={'attachment-list' + (className ? ' ' + className : '')}>
      {uploading.map((item) => (
        <li key={item.key}>
          <ItemPendingComponent
            file={item.file}
            progress={item.progress}
            error={item.error}
          />
        </li>
      ))}
      {attachments.map((attachment) => (
        <li key={attachment.file_name + attachment.file_size}>
          <ItemComponent attachment={attachment} />
        </li>
      ))}
    </ul>
  ) : null;
};
