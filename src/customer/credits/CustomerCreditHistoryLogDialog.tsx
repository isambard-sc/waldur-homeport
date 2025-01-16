import { useSelector } from 'react-redux';

import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerCreditHistoryLogDialog = () => {
  const customer = useSelector(getCustomer);
  return (
    <MetronicModalDialog headerLess bodyClassName="p-0">
      <BaseEventsList
        table="credit-history-events"
        title={translate('History log')}
        filter={{ feature: 'credits', customer_uuid: customer.uuid }}
        initialPageSize={5}
      />
    </MetronicModalDialog>
  );
};
