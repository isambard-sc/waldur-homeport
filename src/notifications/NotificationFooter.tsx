import { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import {
  createNotification,
  createNotificationTemplate,
  sendNotification,
  updateNotification,
} from './api';
import { NotificationFormData, NotificationTemplateFormData } from './types';
import { serializeNotification, serializeNotificationTemplate } from './utils';

export const NotificationFooter = ({
  step,
  setStep,
  handleSubmit,
  refetch,
  disabled,
  notificationId,
}: {
  step;
  setStep;
  handleSubmit;
  refetch;
  disabled;
  notificationId?;
}) => {
  const dispatch = useDispatch();
  const name = useSelector((state) =>
    formValueSelector('NotificationCreateDialog')(state, 'name'),
  );
  const saveAsDraft = useCallback(
    async (formData: NotificationFormData) => {
      try {
        if (notificationId) {
          await updateNotification(
            notificationId,
            serializeNotification(formData),
          );
        } else {
          await createNotification(serializeNotification(formData));
        }
        await refetch();
        dispatch(
          showSuccess(translate('Notification has been saved as a draft.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to save notification.')),
        );
      }
    },
    [dispatch, refetch, notificationId],
  );

  const saveAsTemplate = useCallback(
    async (formData: NotificationTemplateFormData) => {
      try {
        await createNotificationTemplate(
          serializeNotificationTemplate(formData),
        );
        await refetch();
        dispatch(
          showSuccess(translate('Notification has been saved as a template.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to save notification as a template.'),
          ),
        );
      }
    },
    [dispatch, refetch],
  );

  const saveAndSend = useCallback(
    async (formData: NotificationFormData) => {
      try {
        let response;
        if (notificationId) {
          response = await updateNotification(
            notificationId,
            serializeNotification(formData),
          );
        } else {
          response = await createNotification(serializeNotification(formData));
        }
        await sendNotification((response.data as { uuid: string }).uuid);
        await refetch();
        dispatch(showSuccess(translate('Notification has been sent.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to send notification.')),
        );
      }
    },
    [dispatch, refetch, notificationId],
  );

  return (
    <Modal.Footer>
      {step === 0 ? (
        <>
          <CloseDialogButton />
          <Button
            onClick={handleSubmit(saveAsDraft)}
            className="ms-3"
            variant="secondary"
            disabled={disabled}
          >
            <i className="fa fa-file-text" /> {translate('Save as draft')}
          </Button>
          <Button
            onClick={handleSubmit(saveAsTemplate)}
            className="ms-3"
            variant="secondary"
            disabled={disabled || !name}
          >
            <i className="fa fa-sticky-note-o" />{' '}
            {translate('Save as template')}
          </Button>
          <Button onClick={() => setStep(1)} className="ms-3">
            <i className="fa fa-long-arrow-right" />{' '}
            {translate('Select recipients')}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => setStep(0)} variant="secondary">
            <i className="fa fa-long-arrow-left" /> {translate('Back')}
          </Button>
          <Button
            onClick={handleSubmit(saveAsDraft)}
            className="ms-3"
            variant="secondary"
            disabled={disabled}
          >
            <i className="fa fa-file-text" /> {translate('Save as draft')}
          </Button>
          <Button
            disabled={disabled}
            className="ms-3"
            onClick={handleSubmit(saveAndSend)}
          >
            <i className="fa fa-send" /> {translate('Send broadcast')}
          </Button>
        </>
      )}
    </Modal.Footer>
  );
};
