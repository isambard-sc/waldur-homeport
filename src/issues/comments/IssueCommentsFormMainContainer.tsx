import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { translate } from '@waldur/i18n';

import * as actions from './actions';
import { IssueCommentsFormContainer } from './IssueCommentsFormContainer';
import { getCommentFormIsOpen, getIsUiDisabled } from './selectors';

interface PureIssueCommentsFomrMainContainerProps {
  formId: string;
  opened: boolean;
  uiDisabled: boolean;
  toggle(): void;
}

export const PureIssueCommentsFormMainContainer: FunctionComponent<
  PureIssueCommentsFomrMainContainerProps
> = (props) => {
  const { opened, toggle, formId, uiDisabled } = props;

  return (
    <div>
      <div className="m-t-lg mb-2">
        {opened ? (
          <span className="text-muted">{translate('Comment')}</span>
        ) : (
          <button
            className="btn btn-secondary"
            disabled={uiDisabled}
            onClick={toggle}
          >
            <i className="fa fa-comment-o" />
            <span className="p-w-xs">{translate('Add comment')}</span>
          </button>
        )}
      </div>
      <IssueCommentsFormContainer formId={formId} />
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  opened: getCommentFormIsOpen(state, ownProps),
  uiDisabled:
    getIsUiDisabled(state) ||
    !state.issues.comments.issue?.add_comment_is_available,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  toggle: (): void =>
    dispatch(actions.issueCommentsFormToggle(ownProps.formId)),
});

const enhance = compose(connect(mapStateToProps, mapDispatchToProps));

export const IssueCommentsFormMainContainer = enhance(
  PureIssueCommentsFormMainContainer,
);
