import { Modal } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { patch } from '@waldur/core/api';
import { FormGroup, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
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
    await patch(formValues.url, formValues);
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
          <Modal.Header closeButton className="without-border">
            <h2 className="fw-bolder">{translate('Edit user agreement')}</h2>
          </Modal.Header>
          <Modal.Body>
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
          </Modal.Body>
          <Modal.Footer>
            <div className="mb-5 text-end">
              <SubmitButton submitting={submitting} label={translate('Save')} />
            </div>
          </Modal.Footer>
        </form>
      )}
    />
  );
};
