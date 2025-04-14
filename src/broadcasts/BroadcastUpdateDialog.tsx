import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';

import { BroadcastFooter } from './BroadcastFooter';
import { BroadcastForm } from './BroadcastForm';
import { BROADCAST_UPDATE_FORM_ID } from './constants';
import { BroadcastFormData } from './types';

interface BroadcastUpdateDialogOwnProps {
  resolve: {
    uuid: string;
    refetch(): void;
  };
}

export const BroadcastUpdateDialog = reduxForm<
  BroadcastFormData,
  BroadcastUpdateDialogOwnProps
>({
  form: BROADCAST_UPDATE_FORM_ID,
})(({ submitting, invalid, handleSubmit, resolve }) => {
  const [step, setStep] = useState(0);

  return (
    <form>
      <Modal.Header closeButton className="without-border">
        <h2 className="fw-bolder">{translate('Update a broadcast')}</h2>
      </Modal.Header>
      <BroadcastForm submitting={submitting} step={step} setStep={setStep} />
      <BroadcastFooter
        step={step}
        setStep={setStep}
        handleSubmit={handleSubmit}
        disabled={invalid || submitting}
        refetch={resolve.refetch}
        broadcastId={resolve.uuid}
      />
    </form>
  );
});
