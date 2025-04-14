import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';

import { BroadcastFooter } from './BroadcastFooter';
import { BroadcastForm } from './BroadcastForm';
import { BROADCAST_CREATE_FORM_ID } from './constants';
import { BroadcastFormData } from './types';

export const BroadcastCreateDialog = reduxForm<
  BroadcastFormData,
  { resolve: { refetch } }
>({
  form: BROADCAST_CREATE_FORM_ID,
})(({ submitting, invalid, handleSubmit, resolve }) => {
  const [step, setStep] = useState(0);

  return (
    <form>
      <Modal.Header closeButton className="without-border">
        <h2 className="fw-bolder">{translate('Create a broadcast')}</h2>
      </Modal.Header>
      <BroadcastForm submitting={submitting} step={step} setStep={setStep} />
      <BroadcastFooter
        step={step}
        setStep={setStep}
        handleSubmit={handleSubmit}
        disabled={invalid || submitting}
        refetch={resolve.refetch}
      />
    </form>
  );
});
