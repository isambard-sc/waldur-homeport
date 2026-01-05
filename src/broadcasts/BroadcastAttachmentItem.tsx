import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { BroadcastAttachment } from './types';

interface BroadcastAttachmentItemProps {
  attachment: BroadcastAttachment;
  onDelete?(attachment: BroadcastAttachment): void;
  isDeleting?: boolean;
  readOnly?: boolean;
}

export const BroadcastAttachmentItem: FC<BroadcastAttachmentItemProps> = ({
  attachment,
  onDelete,
  isDeleting,
  readOnly,
}) => {
  return (
    <div className="attachment-item">
      {isDeleting && (
        <div className="attachment-item__overlay">
          <LoadingSpinner />
        </div>
      )}
      <div className="attachment-item__thumb">
        <FileIcon size={40} className="text-muted" />
      </div>
      <div className="attachment-item__body">
        <h6 className="fw-bold text-gray-700 mb-0">
          <a
            href={attachment.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 text-hover-primary"
          >
            {attachment.filename}
          </a>
        </h6>
        <p className="fs-6 text-muted mb-0">
          {formatFilesize(attachment.size, 'B')}
          {attachment.uploaded_by_full_name &&
            ` - ${translate('Uploaded by {name} on {date}', {
              name: attachment.uploaded_by_full_name,
              date: formatDateTime(attachment.created),
            })}`}
        </p>
      </div>
      {onDelete && !readOnly ? (
        <div>
          <Button
            variant="flush"
            size="sm"
            className="btn-active-icon-danger attachment-item__delete btn-icon-right"
            onClick={() => onDelete(attachment)}
            disabled={isDeleting}
          >
            <span className="svg-icon svg-icon-2">
              <TrashIcon weight="bold" />
            </span>
          </Button>
        </div>
      ) : null}
    </div>
  );
};
