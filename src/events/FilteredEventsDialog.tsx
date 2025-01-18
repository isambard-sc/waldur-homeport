import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

export const FilteredEventsDialog = ({ filter }) => (
  <MetronicModalDialog headerLess bodyClassName="p-0">
    <BaseEventsList
      table="scope-events"
      title={translate('History log')}
      filter={filter}
      initialPageSize={5}
    />
  </MetronicModalDialog>
);
