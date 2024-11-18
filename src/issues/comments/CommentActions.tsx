import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { type RootState } from '@waldur/store/reducers';

import { issueCommentsFormToggle } from './actions';
import { getIsFormToggleDisabled, getIsUiDisabled, getUser } from './selectors';

const IssueCommentDeleteDialog = lazyComponent(() =>
  import('./IssueCommentDeleteDialog').then((module) => ({
    default: module.IssueCommentDeleteDialog,
  })),
);

export const CommentActions = ({ comment }) => {
  const dispatch = useDispatch();

  const user = useSelector(getUser);
  const uiDisabled = useSelector(getIsUiDisabled);
  const formToggleDisabled = useSelector((state: RootState) =>
    getIsFormToggleDisabled(state, { comment }),
  );

  const toggleForm = () => {
    dispatch(issueCommentsFormToggle(comment.uuid));
  };

  const openDeleteDialog = () => {
    dispatch(
      openModalDialog(IssueCommentDeleteDialog, {
        resolve: { uuid: comment.uuid },
      }),
    );
  };

  return (
    <div className="m-0">
      {(user.is_staff || user.uuid === comment.author_uuid) && (
        <>
          <button
            className="btn btn-color-gray-400 btn-active-color-primary p-0 fw-bold me-3"
            disabled={
              uiDisabled || formToggleDisabled || !comment.update_is_available
            }
            onClick={toggleForm}
          >
            {translate('Edit')}
          </button>
          <button
            className="btn btn-color-gray-400 btn-active-color-primary p-0 fw-bold"
            disabled={uiDisabled || !comment.destroy_is_available}
            onClick={openDeleteDialog}
          >
            {translate('Delete')}
          </button>
        </>
      )}
    </div>
  );
};
