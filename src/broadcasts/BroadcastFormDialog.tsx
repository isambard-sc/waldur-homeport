import { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-final-form';
import {
  BroadcastMessage,
  broadcastMessagesCreate,
  broadcastMessagesRetrieve,
  broadcastMessagesUpdate,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { BroadcastFooter } from './BroadcastFooter';
import { BroadcastForm } from './BroadcastForm';
import { BroadcastAttachment, BroadcastFormData } from './types';
import { serializeBroadcast, useBroadcastFormSubmit } from './utils';

interface BroadcastUpdateDialogOwnProps {
  initialValues?: BroadcastFormData;
  resolve: {
    uuid?: string;
    refetch(): void;
  };
}

export const BroadcastFormDialog = ({
  initialValues,
  resolve,
}: BroadcastUpdateDialogOwnProps) => {
  const [step, setStep] = useState(0);
  const [attachments, setAttachments] = useState<BroadcastAttachment[]>([]);
  const [broadcastData, setBroadcastData] = useState<BroadcastMessage | null>(
    null,
  );
  const [currentUuid, setCurrentUuid] = useState<string | undefined>(
    resolve.uuid,
  );

  const isEdit = Boolean(resolve.uuid);

  const onSubmit = useBroadcastFormSubmit(resolve.refetch, currentUuid);

  // Fetch broadcast data including attachments when editing
  useEffect(() => {
    if (resolve.uuid) {
      broadcastMessagesRetrieve({ path: { uuid: resolve.uuid } })
        .then((response) => {
          setBroadcastData(response.data);
          setAttachments(response.data.attachments || []);
        })
        .catch((error) => {
          console.error('Failed to fetch broadcast data:', error);
        });
    }
  }, [resolve.uuid]);

  // Set default value for send_to_me if not editing
  const defaultInitialValues = isEdit
    ? initialValues
    : { ...initialValues, send_to_me: true };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={defaultInitialValues}
      render={({ handleSubmit, submitting, errors, values, form }) => {
        const handleSaveDraft = useCallback(async (): Promise<string> => {
          const formData = values as BroadcastFormData;

          try {
            let response;
            if (currentUuid) {
              response = await broadcastMessagesUpdate({
                path: { uuid: currentUuid },
                body: serializeBroadcast(formData),
              });
            } else {
              response = await broadcastMessagesCreate({
                body: serializeBroadcast(formData),
              });
              const newUuid = response.data.uuid;
              setCurrentUuid(newUuid);
              return newUuid;
            }
            return currentUuid;
          } catch (error) {
            throw error;
          }
        }, [values, currentUuid]);

        return (
          <form onSubmit={handleSubmit}>
            <Modal.Header closeButton className="without-border">
              <h2 className="fw-bolder">
                {isEdit
                  ? translate('Update a broadcast')
                  : translate('Create a broadcast')}
              </h2>
            </Modal.Header>
            <BroadcastForm
              step={step}
              setStep={setStep}
              broadcastUuid={currentUuid}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              broadcastState={broadcastData?.state}
              onSaveDraft={handleSaveDraft}
            />
            <BroadcastFooter
              step={step}
              setStep={setStep}
              refetch={resolve.refetch}
              form={form}
              disabled={(errors && Object.keys(errors).length > 0) || submitting}
              formValues={values}
              uuid={currentUuid}
            />
          </form>
        );
      }}
    />
  );
};
