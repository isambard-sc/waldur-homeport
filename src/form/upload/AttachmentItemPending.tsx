import { File, Trash } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { Button, ProgressBar } from 'react-bootstrap';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import './AttachmentItem.scss';

interface AttachmentItemPendingProps {
  file: File;
  progress: number;
  error?: any;
  onRetry?(file: File): void;
  onCancel?(file: File): void;
}

export const AttachmentItemPending: FC<AttachmentItemPendingProps> = ({
  file,
  progress,
  error,
  onRetry,
  onCancel,
}) => {
  return (
    <div
      className={classNames('attachment-item', error && 'attachment-error')}
      data-testid="pending-attachment-item"
    >
      <div className="attachment-item__thumb">
        <File size={40} className={error ? 'text-danger' : 'text-muted'} />
      </div>

      <div className="attachment-item__body">
        <h6 className="fw-bold text-gray-700 mb-0">
          {error ? translate('Upload failed, please try again') : file.name}
        </h6>
        <p className="fs-6 text-muted mb-0">
          {error ? file.name : formatFilesize(file.size, 'B')}
        </p>
        {error ? (
          <button
            type="button"
            className="text-btn text-gray-700 text-hover-primary fw-bold"
            onClick={() => onRetry(file)}
          >
            {translate('Try again')}
          </button>
        ) : progress || progress === 0 ? (
          <ProgressBar
            animated={!progress}
            now={progress || 100}
            className="h-8px mt-2"
          />
        ) : null}
      </div>
      <Button
        variant="active-light-danger"
        size="sm"
        className={classNames(
          'btn-icon attachment-item__delete',
          error && 'btn-icon-danger',
        )}
        disabled={!error && progress && progress !== 0}
        onClick={() => onCancel(file)}
      >
        <span className="svg-icon svg-icon-2">
          <Trash weight="bold" />
        </span>
      </Button>
    </div>
  );
};
