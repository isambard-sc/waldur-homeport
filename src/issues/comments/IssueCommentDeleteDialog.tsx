import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';

import * as actions from './actions';

interface IssueCommentDeleteDialogProps {
  resolve: {
    uuid: string;
  };
}

export const IssueCommentDeleteDialog: React.FC<
  IssueCommentDeleteDialogProps
> = (props) => {
  const dispatch = useDispatch();
  const { resolve } = props;

  const onSubmit = (evt: React.FormEvent): void => {
    evt.preventDefault();
    dispatch(actions.issueCommentsDelete(resolve.uuid));
    dispatch(closeModalDialog());
  };

  return (
    <ActionDialog submitLabel={translate('Delete')} onSubmit={onSubmit}>
      <h3 className="text-center">
        {translate('Do you really want to delete comment?')}
      </h3>
    </ActionDialog>
  );
};
