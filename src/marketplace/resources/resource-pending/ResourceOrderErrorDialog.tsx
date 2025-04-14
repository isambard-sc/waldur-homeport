import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Field } from '@waldur/resource/summary';

export const ResourceOrderErrorDialog = ({ resolve }) => {
  return (
    <ModalDialog title={translate('Order errors')} closeButton>
      <Field label={translate('Error message')}>
        {resolve.resource.creation_order.error_message}
      </Field>
      <Field label={translate('Error traceback')} valueClass="text-pre">
        <div style={{ height: 300, overflow: 'scroll' }}>
          {resolve.resource.creation_order.error_traceback}
        </div>
      </Field>
    </ModalDialog>
  );
};
