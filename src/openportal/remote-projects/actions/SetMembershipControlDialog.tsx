import { useMutation } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { openportalRemoteProjectsSetMembershipControl } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

const CHOICES = [
  { label: translate('Open (no restriction)'), value: null },
  { label: translate('Members only'), value: 'members_only' },
  { label: translate('Roles only'), value: 'roles_only' },
  { label: translate('Locked'), value: 'locked' },
];

interface Props {
  row: any;
  resolve: { refetch(): Promise<void> };
}

export const SetMembershipControlDialog = ({ row, resolve }: Props) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const { mutateAsync } = useMutation({
    mutationFn: (values: { membership_control: any }) =>
      openportalRemoteProjectsSetMembershipControl({
        path: { uuid: row.uuid },
        body: { membership_control: values.membership_control?.value ?? null },
      }),
  });

  const handleSubmit = async (values: { membership_control: any }) => {
    try {
      await mutateAsync(values);
      showSuccess(translate('Membership control updated.'));
      closeDialog();
      await resolve.refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update membership control.'));
    }
  };

  const initialChoice =
    CHOICES.find((c) => c.value === (row.membership_control ?? null)) ?? CHOICES[0];

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={{ membership_control: initialChoice }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set membership control')}
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
            <FormGroup
              controlId="membership_control"
              label={translate('Membership control policy')}
            >
              <Field
                name="membership_control"
                render={({ input }) => (
                  <Select
                    options={CHOICES}
                    value={input.value}
                    onChange={input.onChange}
                    isClearable={false}
                  />
                )}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
