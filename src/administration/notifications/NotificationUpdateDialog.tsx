import arrayMutators from 'final-form-arrays';
import { useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { overrideNotificationTemplate } from './api';
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
          await overrideNotificationTemplate(template.url, {
            content: template.content,
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
    <ModalDialog title={translate('Update a notification')}>
      <Form
        onSubmit={onSubmit}
        initialValues={{ templates: resolve.notification.templates }}
        mutators={{
          ...arrayMutators,
        }}
        render={({ handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <NotificationForm submitting={submitting} />
          </form>
        )}
      />
    </ModalDialog>
  );
};
