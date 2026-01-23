import { connect } from 'react-redux';
import { Field, formValueSelector, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';

interface OwnProps {
  resolve: { title?; onSubmit; value? };
}

interface FormData {
  comment: string;
}

interface StateProps {
  commentValue: string;
}

const FORM_ID = 'ReviewCommentForm';
const MAX_LENGTH = 255;
const selector = formValueSelector(FORM_ID);

const TextFieldWithCount = ({ maxLength, ...props }) => {
  const currentLength = props.input?.value?.length || 0;
  const remaining = maxLength - currentLength;
  return (
    <>
      <TextField {...props} maxLength={maxLength} />
      <div className="text-end text-muted mt-1">
        {translate('{remaining} characters remaining', { remaining })}
      </div>
    </>
  );
};

export const CommentFormDialog = connect<StateProps, {}, OwnProps>(
  (state: RootState, ownProps) => ({
    initialValues: { comment: ownProps.resolve.value },
    commentValue: selector(state, 'comment') || '',
  }),
)(
  reduxForm<FormData, OwnProps & StateProps>({
    form: FORM_ID,
  })((props) => {
    return (
      <form onSubmit={props.handleSubmit(props.resolve.onSubmit)}>
        <ModalDialog
          title={
            props.resolve.title
              ? translate('Comment about "{name}"', {
                  name: props.resolve.title,
                })
              : translate('Add comment')
          }
          subtitle={
            props.resolve.title
              ? translate('Please add a comment for the "{name}"', {
                  name: props.resolve.title,
                })
              : null
          }
          footer={
            <>
              <CloseDialogButton variant="tertiary" className="flex-equal" />

              <SubmitButton
                disabled={props.invalid || props.pristine}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-equal"
              />
            </>
          }
        >
          <div className="size-sm">
            <Field
              name="comment"
              component={FormGroup}
              label={translate('Comment')}
              placeholder={translate('Enter a comment...')}
              required
              validate={required}
              hideLabel
              spaceless
              disabled={props.submitting}
              maxLength={MAX_LENGTH}
            >
              <TextFieldWithCount maxLength={MAX_LENGTH} />
            </Field>
          </div>
        </ModalDialog>
      </form>
    );
  }),
);
