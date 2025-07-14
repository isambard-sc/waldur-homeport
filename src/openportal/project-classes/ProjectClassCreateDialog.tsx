import { Form, Field } from 'react-final-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { required } from '@waldur/core/validators';
import { SelectField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

const projectClassCreate = (params) => {
  console.log('Creating project class with params:', params);
  return null;
}

export const ProjectClassCreateDialog = ({ resolve }) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const onSubmit = async (formValues) => {
    try {
      await projectClassCreate({
        body: {
          content: formValues.content,
        },
      });
      showSuccess(translate('Project class has been created'));
      closeDialog();
      await resolve.refetch();
    } catch (error) {
      showErrorResponse(error, translate('Unable to create the project class.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create a project class')}
            footer={
              <div className="mb-5 text-end">
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={translate('Save')}
                />
              </div>
            }
          >
            <FormGroup controlId="content" label={translate('Content')}>
              <Field name="content" component={TextField as any} />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
