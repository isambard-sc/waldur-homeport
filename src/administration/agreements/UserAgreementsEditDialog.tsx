import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { userAgreementsPartialUpdate } from 'waldur-js-client';

import { FormGroup, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showSuccess } from '@waldur/store/notify';

interface UserAgreementsEditDialogOwnProps {
  resolve: {
    initialValues;
    refetch(): void;
  };
}

const agreementTypeLabelMap = {
  pp: translate('Privacy policy'),
  tos: translate('Terms of service'),
};

export const UserAgreementsEditDialog = ({
  resolve,
}: UserAgreementsEditDialogOwnProps) => {
  const dispatch = useDispatch();

  const onSubmit = async (formValues) => {
    await userAgreementsPartialUpdate({
      path: { uuid: formValues.uuid },
      body: formValues,
    });
    await resolve.refetch();
    dispatch(showSuccess(translate('User agreement was updated')));
    dispatch(closeModalDialog());
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={resolve.initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit user agreement')}
            footer={
              <SubmitButton submitting={submitting} label={translate('Save')} />
            }
          >
            <Field
              name="content"
              component={FormGroup as any}
              label={
                agreementTypeLabelMap[
                  resolve.initialValues.agreement_type.toLowerCase()
                ]
              }
            >
              <TextField style={{ height: '520px' }} />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
