import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { formatMediumDateTime, formatRelative } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { getAbbreviation } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { LoadingOverlay } from '@waldur/issues/comments/LoadingOverlay';
import { type RootState } from '@waldur/store/reducers';
import { openUserPopover } from '@waldur/user/actions';

import { CommentActions } from './CommentActions';
import { getIsDeleting } from './selectors';
import { Comment } from './types';

import './IssueCommentItem.scss';

interface IssueCommentItemProps {
  comment: Comment;
}

const nameToColor = (name: string) => {
  const colors = ['primary', 'success', 'info', 'warning', 'danger'];
  const hash = hashStr(name);
  const index = hash % colors.length;
  return colors[index] || 'primary';
};

const hashStr = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

const CommentAvatar = ({ comment }) => {
  const color = nameToColor(comment.author_name);

  return (
    <div className="timeline-icon symbol symbol-circle symbol-32px me-4">
      <div
        className={`symbol-label fs-5 fw-bold bg-light-${color} text-${color}`}
      >
        {getAbbreviation(comment.author_name)}
      </div>
    </div>
  );
};

export const IssueCommentItem: FunctionComponent<IssueCommentItemProps> = ({
  comment,
}) => {
  const deleting = useSelector((state: RootState) =>
    getIsDeleting(state, { comment }),
  );

  const dispatch = useDispatch();

  const openUserDialog = () => {
    dispatch(openUserPopover({ user_uuid: comment.author_uuid }));
  };

  if (deleting) {
    return <LoadingOverlay />;
  }

  return (
    <div className="issue-comment timeline-item">
      <div className="timeline-line w-30px" />
      <CommentAvatar comment={comment} />
      <div className="timeline-content">
        <div className="d-flex justify-content-between gap-5 gap-md-20">
          <div>
            <div className="fs-7 text-muted">
              <button
                onClick={openUserDialog}
                type="button"
                className="text-btn text-gray-700 fw-bold text-hover-primary fs-6 me-3"
              >
                {comment.author_name}
              </button>
              <span title={formatMediumDateTime(comment.created)}>
                {formatRelative(comment.created)}
              </span>
              {!comment.is_public && (
                <span className="text-uppercase">
                  {' - '}
                  {translate('Internal')}
                </span>
              )}
            </div>
            <div className="fs-6 text-muted">
              {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE ===
              'atlassian' ? (
                <FormattedJira text={comment.description} />
              ) : (
                <FormattedHtml html={comment.description} />
              )}
            </div>
          </div>
          <CommentActions comment={comment} />
        </div>
      </div>
    </div>
  );
};
