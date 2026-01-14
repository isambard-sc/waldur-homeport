import { FC } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { User, usersRetrieve } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useUpdateUser } from '@waldur/user/support/useUpdateUser';
import { setCurrentUser } from '@waldur/workspace/actions';

interface SetUnixShortNameDialogProps {
  resolve: {
    user: User;
  };
}

const SetUnixShortNameDialog: FC<SetUnixShortNameDialogProps> = ({
  resolve: { user },
}) => {
  const dispatch = useDispatch();
  const { callback: updateUser } = useUpdateUser(user);

  const onSubmit = async (formData: { unix_username: string }) => {
    await updateUser(formData);
    // Refetch the user to get the updated slug
    const { data: updatedUser } = await usersRetrieve({
      path: { uuid: user.uuid },
    });
    dispatch(setCurrentUser(updatedUser as any));
    dispatch(closeModalDialog());
  };

  return (
    <Form onSubmit={onSubmit} initialValues={{ unix_username: '' }}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set your UNIX username')}
            bodyClassName="pb-2"
            footerClassName="border-0 pt-0"
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Save')}
                className="btn btn-primary w-100"
              />
            }
          >
            <div className="mb-5">
              <p className="text-muted mb-3">
                {translate(
                  'A short, unique name for you. It will be used to form your local username on the systems.',
                )}
              </p>
              <p className="text-muted mb-3">
                {translate(
                  'Should only contain lower-case letters and digits and must start with a letter. Must be between 5 - 20 characters long.',
                )}
              </p>
              <p className="text-warning mb-0">
                <strong>
                  {translate('Once set, it cannot be changed.')}
                </strong>
              </p>
            </div>
            <Field
              name="unix_username"
              validate={required}
              component={StringField as any}
              label={translate('UNIX username')}
              required
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};

export default SetUnixShortNameDialog;
