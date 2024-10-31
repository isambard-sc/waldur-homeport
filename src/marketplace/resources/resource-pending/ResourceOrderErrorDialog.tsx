import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ResourceOrderErrorDialog = ({ resolve }) => {
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Order errors')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Field label={translate('Error message')}>
          {resolve.resource.creation_order.error_message}
        </Field>
        <Field label={translate('Error traceback')} valueClass="text-pre">
          <div style={{ height: 300, overflow: 'scroll' }}>
            {resolve.resource.creation_order.error_traceback}
          </div>
        </Field>
      </Modal.Body>
    </>
  );
};
