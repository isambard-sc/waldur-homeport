import { EventGroup } from '@waldur/events/types';
import { getCustomerContext } from '@waldur/events/utils';
import { translate } from '@waldur/i18n';

import { InvoicesEnum } from '../EventsEnums';

const getInvoiceContext = (event) => ({
  ...getCustomerContext(event),
  period: event.invoice_date,
});

export const InvoiceEvents: EventGroup = {
  title: translate('Invoice events'),
  context: getInvoiceContext,
  events: [
    {
      key: InvoicesEnum.invoice_creation_succeeded,
      title: translate(
        'Invoice for organization {customer_link} for the period of {period} has been created.',
      ),
    },
    {
      key: InvoicesEnum.invoice_deletion_succeeded,
      title: translate(
        'Invoice for organization {customer_name} for the period of {period} has been deleted.',
      ),
    },
    {
      key: InvoicesEnum.invoice_update_succeeded,
      title: translate(
        'Invoice for organization {customer_link} for the period of {period} has been updated.',
      ),
    },
  ],
};
