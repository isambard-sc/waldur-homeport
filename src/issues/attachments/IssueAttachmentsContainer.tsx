import { UploadSimple } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatJsx, translate } from '@waldur/i18n';
import { IssueReload } from '@waldur/issues/IssueReload';
import { type RootState } from '@waldur/store/reducers';

import * as actions from './actions';
import './IssueAttachmentsContainer.scss';
import { IssueAttachmentsList } from './IssueAttachmentsList';
import { getAttachments, getUploading, getIsLoading } from './selectors';
import { Attachment } from './types';

interface IssueAttachmentsContainerProps {
  issue: {
    url: string;
    add_attachment_is_available: boolean;
  };
}

export const IssueAttachmentsContainer: React.FC<
  IssueAttachmentsContainerProps
> = ({ issue }) => {
  const dispatch = useDispatch();
  const dropzoneNode = useRef<DropzoneRef>(null);

  const attachments = useSelector<RootState, Attachment[]>(getAttachments);
  const loading = useSelector<RootState, boolean>(getIsLoading);
  const uploading = useSelector<RootState, number>(getUploading);

  useEffect(() => {
    dispatch(actions.issueAttachmentsGet(issue.url));
  }, [dispatch, issue.url]);

  const onDrop = (files: File[]) => {
    dispatch(actions.issueAttachmentsPut(issue.url, files));
  };

  const openDownloadModal = () => {
    if (dropzoneNode.current) {
      dropzoneNode.current.open();
    }
  };

  return (
    <Dropzone noClick onDrop={onDrop} ref={dropzoneNode}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <Card {...getRootProps({ className: 'dropzone' })}>
          {isDragActive && (
            <div className="dropzone__overlay">
              <div className="dropzone__overlay-message">
                {translate('Drop files to attach them to the issue.')}
              </div>
            </div>
          )}
          <Card.Header>
            <Card.Title>
              <h3>{translate('Attachments')}</h3>
            </Card.Title>
            <div className="card-toolbar">
              <IssueReload issueUrl={issue.url} />
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <LoadingSpinner />
            ) : issue.add_attachment_is_available ? (
              <div className="attachments__container">
                <div className="attachments__container-message">
                  <input {...getInputProps()} />
                  <div className="svg-icon svg-icon-2" aria-hidden="true">
                    <UploadSimple size={32} />
                  </div>
                  {translate(
                    'Drop files to attach, or <button>browse</button>.',
                    {
                      button: (child) => (
                        <button
                          className="text-btn text-dark"
                          type="button"
                          onClick={openDownloadModal}
                        >
                          {child}
                        </button>
                      ),
                    },
                    formatJsx,
                  )}
                </div>
                <IssueAttachmentsList
                  attachments={attachments}
                  uploading={uploading}
                />
              </div>
            ) : null}
          </Card.Body>
        </Card>
      )}
    </Dropzone>
  );
};
