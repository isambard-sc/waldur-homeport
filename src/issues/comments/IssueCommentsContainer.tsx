import { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { type RootState } from '@waldur/store/reducers';

import { Issue } from '../list/types';

import * as actions from './actions';
import { IssueCommentButton } from './IssueCommentButton';
import { IssueCommentsList } from './IssueCommentsList';
import { ReloadComments } from './ReloadComments';
import { getCommentsSelector, getIsLoading } from './selectors';
import { Comment } from './types';

interface IssueCommentsContainerProps {
  issue: Issue;
}

export const IssueCommentsContainer = ({
  issue,
}: IssueCommentsContainerProps) => {
  const dispatch = useDispatch();

  const comments = useSelector<RootState, Comment[]>(getCommentsSelector);
  const loading = useSelector<RootState, boolean>(getIsLoading);

  useEffect(() => {
    dispatch(actions.issueCommentsGet(issue.url));
    dispatch(actions.issueCommentsIssueSet(issue));
  }, [dispatch, issue]);

  return (
    <Card className="card-bordered mb-5">
      <Card.Header>
        <Card.Title>
          <span className="me-2">{translate('Comments')}</span>
          <ReloadComments issueUrl={issue.url} />
        </Card.Title>
        <div className="card-toolbar">
          <IssueCommentButton />
        </div>
      </Card.Header>
      <Card.Body>
        {loading && !comments?.length ? (
          <LoadingSpinner />
        ) : (
          <IssueCommentsList comments={comments} />
        )}
      </Card.Body>
    </Card>
  );
};
