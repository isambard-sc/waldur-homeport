import { pick } from 'es-toolkit/compat';
import { useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { required } from '@waldur/core/validators';
import { SubmitButton, TextField } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

import { EditUserProps } from '../types';

import { useUpdateUser } from './useUpdateUser';

interface EditFieldDialogProps {
  resolve: EditUserProps;
}

export const EditFieldDialog: React.FC<EditFieldDialogProps> = ({
  resolve,
}) => {
  const dispatch = useDispatch();
  const { callback } = useUpdateUser(resolve.user);

  const processRequest = useCallback(
    async (values) => {
      try {
        await callback(values);
        dispatch(closeModalDialog());
      } catch (e) {
        if (e.response && e.response.status === 400) {
          return e.response.data;
        }
      }
    },
    [resolve, dispatch],
  );

  return (
    <Form
      onSubmit={processRequest}
      initialValues={pick(resolve.user, resolve.name)}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <MetronicModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton
                  variant="outline btn-outline-default"
                  className="flex-equal"
                />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Submit')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            {resolve.name === 'description' ? (
              <FormGroup
                label={translate('Description')}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name="description"
                  component={TextField as any}
                  validate={resolve.requiredMsg ? required : undefined}
                  maxLength={500}
                  spaceless
                />
              </FormGroup>
            ) : resolve.name ? (
              <FormGroup
                label={resolve.label}
                required={Boolean(resolve.requiredMsg)}
              >
                <Field
                  name={resolve.name}
                  component={StringField as any}
                  validate={resolve.requiredMsg ? required : undefined}
                  spaceless
                />
              </FormGroup>
            ) : null}
          </MetronicModalDialog>
        </form>
      )}
    />
  );
};
