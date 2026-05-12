import { useMutation } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { openportalRemoteProjectsSetEarliestApprove } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

interface Props {
  row: any;
  resolve: { refetch(): Promise<void> };
}

export const SetEarliestApproveDialog = ({ row, resolve }: Props) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const { mutateAsync } = useMutation({
    mutationFn: (values: { earliest_approve: string | null }) =>
      openportalRemoteProjectsSetEarliestApprove({
        path: { uuid: row.uuid },
        body: { earliest_approve: values.earliest_approve || null },
      }),
  });

  const handleSubmit = async (values: { earliest_approve: string | null }) => {
    try {
      await mutateAsync(values);
      showSuccess(translate('Embargo date updated.'));
      closeDialog();
      await resolve.refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update embargo date.'));
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={{ earliest_approve: row.earliest_approve || null }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set embargo date')}
            footer={
              <div className="text-end">
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={translate('Save')}
                />
              </div>
            }
          >
            <p className="text-muted mb-4">
              {translate(
                'The remote portal will not approve this project before this date. Clear the field to remove the embargo.',
              )}
            </p>
            <FormGroup controlId="earliest_approve" label={translate('Embargo date')}>
              <Field name="earliest_approve" component={DateField} />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
