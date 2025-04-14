import { FC } from 'react';

import { SubmitButton } from '@waldur/form';
import { Form } from '@waldur/form/Form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { RoleForm } from './RoleForm';

interface RoleEditDialogProps {
  submitFn(payload): void;
  resolve: { row };
}

export const RoleEditDialog: FC<RoleEditDialogProps> = (props) => {
  return (
    <Form
      form="RoleForm"
      onSubmit={props.submitFn}
      initialValues={props.resolve.row}
    >
      {(formProps) => (
        <ModalDialog
          title={translate('Edit role')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton
                disabled={formProps.invalid}
                submitting={formProps.submitting}
                label={translate('Save')}
              />
            </>
          }
        >
          <RoleForm
            submitting={formProps.submitting}
            role={props.resolve.row}
          />
        </ModalDialog>
      )}
    </Form>
  );
};
