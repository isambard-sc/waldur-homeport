import { CloudArrowUp } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useRef } from 'react';
import Dropzone, { DropzoneOptions, DropzoneRef } from 'react-dropzone';

import { formatJsx, translate } from '@waldur/i18n';

import './UploadContainer.scss';

interface UploadContainerProps extends DropzoneOptions {
  message?: string;
  className?: string;
}

export const UploadContainer: React.FC<UploadContainerProps> = (props) => {
  const { message, className, ...rest } = props;
  const dropzoneNode = useRef<DropzoneRef>(null);

  const openDownloadModal = () => {
    if (dropzoneNode.current) {
      dropzoneNode.current.open();
    }
  };

  return (
    <Dropzone noClick ref={dropzoneNode} {...rest}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div
          {...getRootProps({
            className: classNames('dropzone metronic-upload', className),
          })}
        >
          {isDragActive && (
            <div className="dropzone__overlay">
              <div className="dropzone__overlay-message">
                {translate('Drop files to attach them.')}
              </div>
            </div>
          )}
          <div className="dropzone-message text-muted">
            <input {...getInputProps()} />
            <span className="icon" aria-hidden="true">
              <CloudArrowUp size={20} weight="bold" className="text-primary" />
            </span>
            <div>
              {translate(
                '<button>Click to upload</button> or drag and drop',
                {
                  button: (child) => (
                    <button
                      className="text-anchor fw-bold"
                      type="button"
                      onClick={openDownloadModal}
                    >
                      {child}
                    </button>
                  ),
                },
                formatJsx,
              )}
              <div className="fs-7 mt-1">{message}</div>
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
};
