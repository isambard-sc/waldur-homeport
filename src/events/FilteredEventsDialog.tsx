import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

export const FilteredEventsDialog = ({ filter }) => (
  <ModalDialog headerLess bodyClassName="p-0">
    <BaseEventsList
      table="scope-events"
      title={translate('History log')}
      filter={filter}
      initialPageSize={5}
    />
  </ModalDialog>
);
