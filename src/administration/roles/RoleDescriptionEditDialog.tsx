import { useMemo } from 'react';
import { Modal, Stack } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';

import { ENV } from '@waldur/configs/default';
import { CancelButton, StringField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

import { updateRoleDescriptions, getRoles } from './api';

export const RoleDescriptionEditDialog = ({ resolve: { row, refetch } }) => {
  const { closeDialog } = useModal();
  const onSubmit = async (formData) => {
    await updateRoleDescriptions(row.uuid, formData);
    ENV.roles = await getRoles();
    closeDialog();
    refetch();
  };

  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        ENV.languageChoices.map(({ code }) => [
          `description_${code}`,
          row[`description_${code}`],
        ]),
      ),
    [ENV.languageChoices, row],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <Modal.Header>
            <Modal.Title>{translate('Edit role description')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table">
                <tbody>
                  {ENV.languageChoices.map(({ code, label }) => (
                    <tr key={code}>
                      <td className="align-middle fw-bold">{label}</td>
                      <td>
                        <Field
                          name={`description_${code}`}
                          component={StringField as any}
                          className="form-control"
                          disabled={submitting}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Stack direction="horizontal" gap={4}>
              <CancelButton label={translate('Cancel')} />
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Save')}
              />
            </Stack>
          </Modal.Footer>
        </form>
      )}
    />
  );
};
