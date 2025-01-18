import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

export const InvoiceEventsDialog = ({ resolve: { invoice } }) => {
  return (
    <MetronicModalDialog headerLess bodyClassName="p-0">
      <BaseEventsList
        table="invoice-events"
        title={translate('History log')}
        filter={{ feature: 'invoices', scope: invoice.url }}
        initialPageSize={5}
      />
    </MetronicModalDialog>
  );
};
