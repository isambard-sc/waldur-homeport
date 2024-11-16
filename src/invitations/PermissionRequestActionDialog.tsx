import { FunctionComponent } from 'react';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { USER_PERMISSION_REQUESTS_ACTION_FORM_ID } from '@waldur/invitations/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OwnProps {
  resolve: {
    title: string;
    submitRequest: (comment: string) => void;
  };
}

const PurePermissionRequestActionDialog: FunctionComponent<
  InjectedFormProps & OwnProps & { handleSubmit }
> = (props) => {
  const submitRequest = (formData) => {
    props.resolve.submitRequest(formData?.comment);
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={props.resolve.title}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <TextField
            name="comment"
            label={translate('Comment')}
            maxLength={150}
            rows={4}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

export const PermissionRequestActionDialog = reduxForm({
  form: USER_PERMISSION_REQUESTS_ACTION_FORM_ID,
})(PurePermissionRequestActionDialog);
