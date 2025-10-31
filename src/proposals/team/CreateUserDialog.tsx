import { EnvelopeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { email, required } from '@waldur/core/validators';
import { FormContainer, StringField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { createProposalUser } from './api';

const FORM_ID = 'CreateUserDialog';

interface CreateUserDialogFormData {
  email: string;
  first_name: string;
  last_name: string;
}

interface CreateUserDialogProps {
  onUserCreated: (user: any) => void;
}

export const CreateUserDialog: FunctionComponent<any> = reduxForm<
  CreateUserDialogFormData,
  CreateUserDialogProps
>({
  form: FORM_ID,
})(({ submitting, handleSubmit, invalid, onUserCreated }) => {
  const { showSuccess, showErrorResponse } = useNotify();

  const createUser = async (formData: CreateUserDialogFormData) => {
    try {
      // Call the API to create the user (currently using mock data)
      const user = await createProposalUser({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      // Call the callback with the created user
      onUserCreated(user);
      showSuccess(translate('User has been created.'));
    } catch (error) {
      showErrorResponse(error, translate('Unable to create user.'));
    }
  };

  return (
    <form onSubmit={handleSubmit(createUser)}>
      <ModalDialog
        title={translate('Create user')}
        subtitle={translate(
          'Enter the details of the user you want to create.',
        )}
        iconNode={<EnvelopeIcon weight="bold" />}
        iconColor="primary"
        footer={
          <>
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              label={translate('Create')}
              submitting={submitting}
              disabled={invalid}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <FormContainer submitting={submitting}>
          <StringField
            name="email"
            label={translate('Email')}
            placeholder={translate('Enter email address...')}
            required={true}
            validate={[required, email]}
          />
          <StringField
            name="first_name"
            label={translate('First name')}
            placeholder={translate('Enter first name...')}
            required={true}
            validate={[required]}
          />
          <StringField
            name="last_name"
            label={translate('Last name')}
            placeholder={translate('Enter last name...')}
            required={true}
            validate={[required]}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
