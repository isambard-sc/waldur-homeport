import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import { IssueAttachment } from './IssueAttachment';
import { Attachment } from './types';
import './IssueAttachmentsList.scss';

interface IssueAttachmentsListProps {
  attachments: Attachment[];
  uploading: number;
}

export const IssueAttachmentsList: FunctionComponent<
  IssueAttachmentsListProps
> = ({ attachments, uploading }) => {
  return attachments.length > 0 || uploading > 0 ? (
    <ul className="attachment-list">
      {attachments.map((attachment) => (
        <li key={attachment.uuid}>
          <IssueAttachment attachment={attachment} />
        </li>
      ))}
      {Array.from({ length: uploading }, (_, i) => (
        <li key={`attachment-loading-${i}`}>
          <div className="attachment-item-loading">
            <div className="attachment-item__overlay">
              <LoadingSpinner />
            </div>
          </div>
        </li>
      ))}
    </ul>
  ) : null;
};
