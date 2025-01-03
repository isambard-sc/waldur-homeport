import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';

import { getIssue } from '../comments/selectors';

import { issueAttachmentsPutCancel, issueAttachmentsPutRetry } from './actions';

interface IssueAttachmentPendingProps {
  file: File;
  progress: number;
  error?: any;
}

export const IssueAttachmentPending: FunctionComponent<
  IssueAttachmentPendingProps
> = ({ file, progress, error }) => {
  const dispatch = useDispatch();
  const issue = useSelector(getIssue);

  const retry = () => {
    dispatch(issueAttachmentsPutRetry(issue.url, file));
  };
  const deleteFile = () => {
    dispatch(issueAttachmentsPutCancel(file));
  };

  return (
    <AttachmentItemPending
      file={file}
      progress={progress}
      error={error}
      onRetry={retry}
      onCancel={deleteFile}
    />
  );
};
