import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { getById } from '@waldur/core/api';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { injectReducer, injectSaga } from '@waldur/store/store';

import { IssueAttachmentsContainer } from './attachments/IssueAttachmentsContainer';
import { IssueCommentsContainer } from './comments/IssueCommentsContainer';
import { IssueSummary } from './IssueSummary';

const linkify = (s) =>
  s.replace(
    /\[(.+?)\|(.+)\]/g,
    (_, name, href) => `<a href="${href}">${name}</a>`,
  );

const loadIssue = (id) => getById<any>('/support-issues/', id);

const loadDependencies = async (issueId: string) => {
  const [issue, issueAttachmentsSaga, issueCommentsSaga, reducer] =
    await Promise.all([
      loadIssue(issueId),
      import('@waldur/issues/attachments/effects').then(
        (module) => module.default,
      ),
      import('@waldur/issues/comments/effects').then(
        (module) => module.default,
      ),
      import('@waldur/issues/reducers').then((module) => module.reducer),
    ]);
  injectSaga('issueAttachmentsSaga', issueAttachmentsSaga);
  injectSaga('issueCommentsSaga', issueCommentsSaga);
  injectReducer('issues', reducer);
  return issue;
};

export const IssueDetails: FunctionComponent = () => {
  useTitle(translate('Request detail'));

  const {
    params: { issue_uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();

  if (!issue_uuid) {
    router.stateService.go('errorPage.notFound');
  }

  const {
    loading,
    error,
    value: issue,
  } = useAsync(() => loadDependencies(issue_uuid));

  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load data.')}</>;
  }

  return (
    <Row>
      <Col sm={8}>
        <Card className="card-bordered mb-6">
          <Card.Header>
            <Card.Title>
              {issue.key ? `${issue.key}: ${issue.summary}` : issue.summary}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE === 'atlassian' ? (
              <FormattedJira text={linkify(issue?.description)} />
            ) : (
              <FormattedHtml html={linkify(issue?.description)} />
            )}
          </Card.Body>
        </Card>
        <IssueCommentsContainer issue={issue} />
      </Col>
      <Col sm={4}>
        <Card className="card-bordered mb-6">
          <Card.Header>
            <Card.Title>{translate('Summary')}</Card.Title>
          </Card.Header>
          <Card.Body>
            <IssueSummary issue={issue} />
          </Card.Body>
        </Card>

        <IssueAttachmentsContainer issue={issue} />
      </Col>
    </Row>
  );
};
