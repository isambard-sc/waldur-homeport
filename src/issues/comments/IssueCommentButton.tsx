import { Plus } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { type RootState } from '@waldur/store/reducers';

import { getIsUiDisabled } from './selectors';

const CommentFormDialog = lazyComponent(() =>
  import('./CommentFormDialog').then((module) => ({
    default: module.CommentFormDialog,
  })),
);

export const IssueCommentButton: FC = () => {
  const dispatch = useDispatch();
  const uiDisabled = useSelector(
    (state: RootState) =>
      getIsUiDisabled(state) ||
      !state.issues.comments.issue?.add_comment_is_available,
  );

  const openCommentDialog = () => {
    dispatch(openModalDialog(CommentFormDialog, { size: 'sm' }));
  };

  return (
    <Button
      variant="secondary"
      disabled={uiDisabled}
      onClick={openCommentDialog}
    >
      <span className="svg-icon svg-icon-2">
        <Plus weight="bold" />
      </span>
      {translate('Add comment')}
    </Button>
  );
};
