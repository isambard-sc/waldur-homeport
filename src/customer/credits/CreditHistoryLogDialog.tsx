import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { InvoicesEnum } from '@waldur/EventsEnums';
import { translate } from '@waldur/i18n';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

const eventsFilter = {
  event_type: [
    InvoicesEnum.update_of_credit_by_staff,
    InvoicesEnum.create_of_credit_by_staff,
    InvoicesEnum.set_to_zero_overdue_credit,
    InvoicesEnum.allowed_offerings_have_been_updated,
  ],
};

export const CreditHistoryLogDialog = () => {
  return (
    <MetronicModalDialog headerLess bodyClassName="p-0">
      <BaseEventsList
        table="credit-history-events"
        title={translate('History log')}
        filter={eventsFilter}
        initialPageSize={5}
      />
    </MetronicModalDialog>
  );
};
