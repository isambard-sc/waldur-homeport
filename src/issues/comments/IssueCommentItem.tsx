import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { LoadingOverlay } from '@waldur/issues/comments/LoadingOverlay';
import { type RootState } from '@waldur/store/reducers';

import { CommentActions } from './CommentActions';
import { CommentHeader } from './CommentHeader';
import { IssueCommentsFormContainer } from './IssueCommentsFormContainer';
import { getIsDeleting } from './selectors';
import { Comment } from './types';

interface IssueCommentItemProps {
  comment: Comment;
}

export const IssueCommentItem: FunctionComponent<IssueCommentItemProps> = ({
  comment,
}) => {
  const deleting = useSelector((state: RootState) =>
    getIsDeleting(state, { comment }),
  );

  if (deleting) {
    return <LoadingOverlay />;
  }

  return (
    <div className="card card-bordered mb-9">
      <div className="card-body">
        <div className="w-100 d-flex flex-stack mb-8">
          <CommentHeader comment={comment} />
          <CommentActions comment={comment} />
        </div>

        <p className="fw-normal fs-5 text-gray-700 m-0" aria-hidden="true">
          {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE === 'atlassian' ? (
            <FormattedJira text={comment.description} />
          ) : (
            <FormattedHtml html={comment.description} />
          )}
        </p>
        <IssueCommentsFormContainer
          formId={comment.uuid}
          defaultMessage={comment.description}
        />
      </div>
    </div>
  );
};
