import { FC } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { showErrorResponse } from '@waldur/store/notify';

import { Issue } from '../list/types';

import * as actions from './actions';
import { createComment, updateComment } from './api';
import * as constants from './constants';
import { getIssue } from './selectors';

interface CommentFormDialogProps extends InjectedFormProps {
  resolve: { comment };
  isEdit: boolean;
  issue: Issue;
}

const PureCommentFormDialog: FC<CommentFormDialogProps> = (props) => {
  const onSubmit = async (data: { [key: string]: string }, dispatch) => {
    if (props.isEdit) {
      try {
        const response = await updateComment(
          data[constants.FORM_FIELDS.comment],
          props.resolve.comment.uuid,
        );
        dispatch(actions.issueCommentsUpdateSuccess(response.data));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to edit comment.')),
        );
      }
    } else {
      try {
        const response = await createComment(
          data[constants.FORM_FIELDS.comment],
          props.issue.uuid,
        );
        dispatch(actions.issueCommentsCreateSuccess(response.data));
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to post comment.')),
        );
      }
    }
  };

  return (
    <form onSubmit={props.handleSubmit(onSubmit)}>
      <MetronicModalDialog
        title={
          props.isEdit ? translate('Change comment') : translate('Add comment')
        }
        footer={
          <>
            <CloseDialogButton
              variant="outline btn-outline-default"
              className="flex-equal"
            />
            <SubmitButton
              submitting={props.submitting}
              disabled={props.invalid || props.submitting}
              label={translate('Confirm')}
              className="btn btn-primary flex-equal"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <TextField
            name={constants.FORM_FIELDS.comment}
            spaceless
            hideLabel
            placeholder={translate('Enter a comment') + '...'}
            validate={required}
            autoFocus
          />
        </FormContainer>
      </MetronicModalDialog>
    </form>
  );
};

const mapStateToProps = (state, ownProps) => ({
  isEdit: Boolean(ownProps.resolve?.comment),
  initialValues: ownProps.resolve?.comment
    ? { [constants.FORM_FIELDS.comment]: ownProps.resolve.comment.description }
    : undefined,
  issue: getIssue(state),
});

const enhance = compose(
  connect(mapStateToProps),
  reduxForm({
    form: constants.MAIN_FORM_ID,
    destroyOnUnmount: true,
  }),
);

export const CommentFormDialog = enhance(PureCommentFormDialog);
