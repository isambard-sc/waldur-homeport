import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { RoleForm } from './RoleForm';

interface RoleCreateDialogProps {
  submitFn(payload): void;
}

export const RoleCreateDialog = reduxForm<{}, RoleCreateDialogProps>({
  form: 'RoleForm',
})((props) => (
  <form onSubmit={props.handleSubmit(props.submitFn)}>
    <ModalDialog
      title={translate('New role')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </>
      }
    >
      <RoleForm submitting={props.submitting} />
    </ModalDialog>
  </form>
));
