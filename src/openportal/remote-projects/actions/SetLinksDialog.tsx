import { useMutation } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { openportalRemoteProjectsSetLinks } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

interface LinkValue {
  id?: string;
  url?: string;
}

interface FormValues {
  award: LinkValue;
  call: LinkValue;
  renewal: LinkValue;
}

interface Props {
  row: any;
  resolve: { refetch(): Promise<void> };
}

const LinkFields = ({ prefix, label }: { prefix: string; label: string }) => (
  <div className="mb-4">
    <h6 className="fw-semibold mb-2">{label}</h6>
    <div className="row g-2">
      <div className="col-md-4">
        <FormGroup controlId={`${prefix}.id`} label={translate('ID')}>
          <Field
            name={`${prefix}.id`}
            render={({ input }) => (
              <input {...input} className="form-control" placeholder={translate('Identifier')} />
            )}
          />
        </FormGroup>
      </div>
      <div className="col-md-8">
        <FormGroup controlId={`${prefix}.url`} label={translate('URL')}>
          <Field
            name={`${prefix}.url`}
            render={({ input }) => (
              <input
                {...input}
                className="form-control"
                type="url"
                placeholder="https://..."
              />
            )}
          />
        </FormGroup>
      </div>
    </div>
  </div>
);

const linkFromRow = (link: any): LinkValue => ({
  id: link?.id ?? '',
  url: link?.url ?? '',
});

const linkToBody = (v: LinkValue) =>
  v?.id || v?.url ? { id: v.id || null, url: v.url || null } : null;

export const SetLinksDialog = ({ row, resolve }: Props) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const { mutateAsync } = useMutation({
    mutationFn: (values: FormValues) =>
      openportalRemoteProjectsSetLinks({
        path: { uuid: row.uuid },
        body: {
          award: linkToBody(values.award),
          call: linkToBody(values.call),
          renewal: linkToBody(values.renewal),
        },
      }),
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(values);
      showSuccess(translate('Links updated.'));
      closeDialog();
      await resolve.refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update links.'));
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={{
        award: linkFromRow(row.link_award),
        call: linkFromRow(row.link_call),
        renewal: linkFromRow(row.link_renewal),
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set award links')}
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
            <LinkFields prefix="award" label={translate('Award')} />
            <LinkFields prefix="call" label={translate('Call')} />
            <LinkFields prefix="renewal" label={translate('Renewal')} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
