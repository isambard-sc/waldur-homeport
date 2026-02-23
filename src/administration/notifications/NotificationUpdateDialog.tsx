import arrayMutators from 'final-form-arrays';
import { useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  Notification,
  notificationMessagesTemplatesOverride,
  NotificationTemplateDetailSerializers,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { NotificationForm } from './NotificationForm';

function findDifferentTemplates(
  formTemplates: NotificationTemplateDetailSerializers[],
  baseTemplates: NotificationTemplateDetailSerializers[],
) {
  return formTemplates.filter((formTemplate) => {
    const base = baseTemplates.find((t) => t.uuid === formTemplate.uuid);
    return base && formTemplate.content !== base.content;
  });
}

export const NotificationUpdateDialog = ({
  resolve,
}: {
  resolve: { notification: Notification; refetch };
}) => {
  const dispatch = useDispatch();

  const initialTemplates = resolve.notification.templates.map((t) => ({
    ...t,
    content: t.content ?? t.original_content,
  }));

  const onSubmit = useCallback(
    async (formData) => {
      const templatesToUpdate = findDifferentTemplates(
        formData.templates,
        initialTemplates,
      );

      if (templatesToUpdate.length === 0) {
        dispatch(closeModalDialog());
        return;
      }

      for (const template of templatesToUpdate) {
        try {
          await notificationMessagesTemplatesOverride({
            path: { uuid: template.uuid },
            body: {
              content: template.content,
            },
          });
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update a notification.')),
          );
          return;
        }
      }
      await resolve.refetch();
      dispatch(showSuccess(translate('Notification has been updated.')));
      dispatch(closeModalDialog());
    },
    [dispatch, resolve],
  );

  // @ts-ignore
  const contextSchema = resolve.notification.context_schema;
  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ templates: initialTemplates }}
      mutators={{
        ...arrayMutators,
      }}
      render={({ handleSubmit, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update notification template')}
            subtitle={resolve.notification.description}
            footer={
              <SubmitButton
                submitting={submitting}
                disabled={pristine}
                label={translate('Save')}
              />
            }
          >
            <NotificationForm schema={contextSchema} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
