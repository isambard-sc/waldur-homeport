import { EventGroup } from '@waldur/events/types';
import { getCustomerContext } from '@waldur/events/utils';
import { translate } from '@waldur/i18n';

import { PaymentsEnum } from '../EventsEnums';

export const PaymentEvents: EventGroup = {
  title: translate('Payment events'),
  context: getCustomerContext,
  events: [
    {
      key: PaymentsEnum.payment_approval_succeeded,
      title: translate('Payment for {customer_link} has been approved.'),
    },
    {
      key: PaymentsEnum.payment_cancel_succeeded,
      title: translate('Payment for {customer_link} has been cancelled.'),
    },
    {
      key: PaymentsEnum.payment_creation_succeeded,
      title: translate('Created a new payment for {customer_link}.'),
    },
  ],
};
