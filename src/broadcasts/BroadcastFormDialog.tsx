import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-final-form';

import { translate } from '@waldur/i18n';

import { BroadcastFooter } from './BroadcastFooter';
import { BroadcastForm } from './BroadcastForm';
import { BroadcastFormData } from './types';
import { useBroadcastFormSubmit } from './utils';

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

  const isEdit = Boolean(resolve.uuid);

  const onSubmit = useBroadcastFormSubmit(resolve.refetch, resolve.uuid);

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, errors, values, form }) => (
        <form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="without-border">
            <h2 className="fw-bolder">
              {isEdit
                ? translate('Update a broadcast')
                : translate('Create a broadcast')}
            </h2>
          </Modal.Header>
          <BroadcastForm step={step} setStep={setStep} />
          <BroadcastFooter
            step={step}
            setStep={setStep}
            refetch={resolve.refetch}
            form={form}
            disabled={(errors && Object.keys(errors).length > 0) || submitting}
            formValues={values}
            uuid={resolve.uuid}
          />
        </form>
      )}
    />
  );
};
