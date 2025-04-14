import arrayMutators from 'final-form-arrays';
import { useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { notificationMessagesTemplatesOverride } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { NotificationForm } from './NotificationForm';

function findDifferentTemplates(formTemplate, initTemplate) {
  const formTemplates = formTemplate.templates;
  const initTemplates = initTemplate.templates;

  return formTemplates.filter((template1) => {
    const matchingTemplate2 = initTemplates.find(
      (template2) => template2.content === template1.content,
    );
    return !matchingTemplate2;
  });
}

export const NotificationUpdateDialog = ({ resolve }) => {
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    async (formData) => {
      const templatesToUpdate = findDifferentTemplates(formData, {
        templates: resolve.notification.templates,
      });

      for (const template of templatesToUpdate) {
        try {
          await notificationMessagesTemplatesOverride({
            path: { uuid: template.uuid },
            body: {
              content: template.content,
            },
          });
          await resolve.refetch();
          dispatch(showSuccess(translate('Notification has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update a notification.')),
          );
        }
      }
    },
    [dispatch, resolve],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ templates: resolve.notification.templates }}
      mutators={{
        ...arrayMutators,
      }}
      render={({ handleSubmit, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update a notification')}
            footer={
              <SubmitButton
                submitting={submitting}
                disabled={pristine}
                label={translate('Save')}
              />
            }
          >
            <NotificationForm submitting={submitting} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
