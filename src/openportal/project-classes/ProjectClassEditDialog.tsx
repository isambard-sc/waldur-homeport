import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { FormGroup, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showSuccess } from '@waldur/store/notify';

const projectClassPartialUpdate = (params) => {
  console.log('Updating project class with params:', params);
  return null;
}

interface ProjectClassEditDialogOwnProps {
  resolve: {
    initialValues;
    refetch(): void;
  };
}

export const ProjectClassEditDialog = ({
  resolve,
}: ProjectClassEditDialogOwnProps) => {
  const dispatch = useDispatch();

  const onSubmit = async (formValues) => {
    await projectClassPartialUpdate({
      path: { uuid: formValues.uuid },
      body: formValues,
    });
    await resolve.refetch();
    dispatch(showSuccess(translate('Project class was updated')));
    dispatch(closeModalDialog());
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={resolve.initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit project class')}
            footer={
              <SubmitButton submitting={submitting} label={translate('Save')} />
            }
          >
            <Field
              name="content"
              component={FormGroup as any}
            >
              <TextField style={{ height: '520px' }} />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
