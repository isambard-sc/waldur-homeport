import { useMutation } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import { openportalRemoteProjectsAddNote } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { getUser } from '@waldur/workspace/selectors';

interface Props {
  row: any;
  resolve: { refetch(): Promise<void> };
}

export const AddNoteDialog = ({ row, resolve }: Props) => {
  const user = useSelector(getUser);
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const { mutateAsync } = useMutation({
    mutationFn: (values: { text: string }) =>
      openportalRemoteProjectsAddNote({
        path: { uuid: row.uuid },
        body: { author: user?.full_name || user?.username || '', text: values.text },
      }),
  });

  const handleSubmit = async (values: { text: string }) => {
    try {
      await mutateAsync(values);
      showSuccess(translate('Note added.'));
      closeDialog();
      await resolve.refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to add note.'));
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      render={({ handleSubmit, submitting, invalid, pristine }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Add note')}
            footer={
              <div className="text-end">
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid || pristine}
                  label={translate('Add note')}
                />
              </div>
            }
          >
            <FormGroup
              controlId="text"
              label={translate('Note')}
              required
            >
              <Field
                name="text"
                validate={(v) => (v?.trim() ? undefined : translate('Required.'))}
                render={({ input, meta }) => (
                  <>
                    <textarea
                      {...input}
                      className="form-control"
                      rows={4}
                      placeholder={translate('Enter note text...')}
                    />
                    {meta.touched && meta.error && (
                      <div className="text-danger mt-1">{meta.error}</div>
                    )}
                  </>
                )}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
