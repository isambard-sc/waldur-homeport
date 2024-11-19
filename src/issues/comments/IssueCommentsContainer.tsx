import { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { issueAttachmentsPut } from '@waldur/issues/attachments/actions';
import { LoadingOverlay } from '@waldur/issues/comments/LoadingOverlay';
import { IssueReload } from '@waldur/issues/IssueReload';
import { type RootState } from '@waldur/store/reducers';

import { Issue } from '../list/types';

import * as actions from './actions';
import * as constants from './constants';
import { IssueCommentsFormMainContainer } from './IssueCommentsFormMainContainer';
import { IssueCommentsList } from './IssueCommentsList';
import { getCommentsSelector, getIsLoading } from './selectors';
import { Comment } from './types';

interface IssueCommentsContainerProps {
  issue: Issue;
}

export const IssueCommentsContainer = ({
  issue,
}: IssueCommentsContainerProps) => {
  const dispatch = useDispatch();
  const dropzoneRef = useRef<DropzoneRef>(null);

  const comments = useSelector<RootState, Comment[]>(getCommentsSelector);
  const loading = useSelector<RootState, boolean>(getIsLoading);

  useEffect(() => {
    dispatch(actions.issueCommentsGet(issue.url));
    dispatch(actions.issueCommentsIssueSet(issue));
  }, [dispatch, issue]);

  const onDrop = (files: File[]) => {
    dispatch(issueAttachmentsPut(issue.url, files));
  };

  return (
    <Dropzone noClick onDrop={onDrop} ref={dropzoneRef}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div
          {...getRootProps({ className: 'dropzone' })}
          style={{ position: 'relative' }}
        >
          {isDragActive && (
            <LoadingOverlay
              className="loading-overlay_border_dashed"
              message={translate('Drop files to attach them to the issue.')}
            />
          )}
          <input {...getInputProps()} />
          <Card className="card-bordered">
            <div className="card-header content-between-center">
              <h4>{translate('Comments')}</h4>
              <div>
                <IssueReload issueUrl={issue.url} />
              </div>
            </div>
            <Card.Body>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <IssueCommentsFormMainContainer
                    formId={constants.MAIN_FORM_ID}
                  />
                  <IssueCommentsList comments={comments} />
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      )}
    </Dropzone>
  );
};
