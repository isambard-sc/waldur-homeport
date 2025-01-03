import { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { translate } from '@waldur/i18n';
import { type RootState } from '@waldur/store/reducers';

import * as actions from './actions';
import { IssueAttachmentsList } from './IssueAttachmentsList';
import { ReloadAttachments } from './ReloadAttachments';
import { getAttachments, getUploading, getIsLoading } from './selectors';
import { Attachment, IssueAttachmentUploading } from './types';

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

  const attachments = useSelector<RootState, Attachment[]>(getAttachments);
  const loading = useSelector<RootState, boolean>(getIsLoading);
  const uploading = useSelector<RootState, IssueAttachmentUploading[]>(
    getUploading,
  );

  useEffect(() => {
    dispatch(actions.issueAttachmentsGet(issue.url));
  }, [dispatch, issue.url]);

  const onDrop = (files: File[]) => {
    dispatch(actions.issueAttachmentsPut(issue.url, files));
  };

  return (
    <Card className="card-bordered issue-attachments">
      <Card.Header>
        <Card.Title>
          <span className="me-2">{translate('Attachments')}</span>
          <ReloadAttachments issueUrl={issue.url} />
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {issue.add_attachment_is_available ? (
          <UploadContainer
            onDrop={onDrop}
            disabled={loading}
            message={translate('SVG, PNG, JPG or GIF (max. 800x400px)')}
          />
        ) : null}
        {loading && !attachments?.length ? (
          <LoadingSpinner />
        ) : (
          <IssueAttachmentsList
            attachments={attachments}
            uploading={uploading}
          />
        )}
      </Card.Body>
    </Card>
  );
};
