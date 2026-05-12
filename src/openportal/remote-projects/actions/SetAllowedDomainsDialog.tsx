import { useMutation } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { openportalRemoteProjectsSetAllowedDomains } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

interface Props {
  row: any;
  resolve: { refetch(): Promise<void> };
}

const domainsToText = (domains: string[] | null | undefined): string =>
  (domains ?? []).join('\n');

const textToDomains = (text: string): string[] =>
  text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

export const SetAllowedDomainsDialog = ({ row, resolve }: Props) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const { mutateAsync } = useMutation({
    mutationFn: (values: { domains_text: string }) =>
      openportalRemoteProjectsSetAllowedDomains({
        path: { uuid: row.uuid },
        body: { allowed_domains: textToDomains(values.domains_text) },
      }),
  });

  const handleSubmit = async (values: { domains_text: string }) => {
    try {
      await mutateAsync(values);
      showSuccess(translate('Allowed domains updated.'));
      closeDialog();
      await resolve.refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update allowed domains.'));
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={{ domains_text: domainsToText(row.allowed_domains) }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Set allowed domains')}
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
                'Enter one domain pattern per line (or comma-separated). Leave empty to allow all domains.',
              )}
            </p>
            <FormGroup controlId="domains_text" label={translate('Allowed domain patterns')}>
              <Field
                name="domains_text"
                render={({ input }) => (
                  <textarea
                    {...input}
                    className="form-control font-monospace"
                    rows={6}
                    placeholder={'@example.ac.uk\n@bristol.ac.uk'}
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
