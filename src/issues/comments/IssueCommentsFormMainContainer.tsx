import { ChatCircleText } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import * as actions from './actions';
import { IssueCommentsFormContainer } from './IssueCommentsFormContainer';
import { getCommentFormIsOpen, getIsUiDisabled } from './selectors';

interface IssueCommentsFormMainContainerProps {
  formId: string;
}

export const IssueCommentsFormMainContainer: FunctionComponent<
  IssueCommentsFormMainContainerProps
> = ({ formId }) => {
  const dispatch = useDispatch();
  const opened = useSelector((state: RootState) =>
    getCommentFormIsOpen(state, { formId }),
  );
  const uiDisabled = useSelector(
    (state: RootState) =>
      getIsUiDisabled(state) ||
      !state.issues.comments.issue?.add_comment_is_available,
  );

  const toggle = () => {
    dispatch(actions.issueCommentsFormToggle(formId));
  };

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
            <span className="svg-icon svg-icon-2">
              <ChatCircleText />
            </span>{' '}
            <span className="p-w-xs">{translate('Add comment')}</span>
          </button>
        )}
      </div>
      <IssueCommentsFormContainer formId={formId} />
    </div>
  );
};
