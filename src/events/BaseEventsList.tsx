import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { EventTypesButton, EventTypesDropdownItem } from './EventTypesButton';
import { ExpandableEventDetails } from './ExpandableEventDetails';

const EventDateField = ({ row }) => <>{formatDateTime(row.created)}</>;

export const BaseEventsList: FunctionComponent<{
  filter?;
  table?: string;
  filters?;
  title?;
  id?;
  initialPageSize?;
  className?;
  actions?;
  hasActionBar?;
}> = ({
  filter,
  filters,
  table,
  title,
  id,
  initialPageSize,
  className,
  actions,
  hasActionBar = true,
}) => {
  const options = useMemo(
    () => ({
      table: table || 'events',
      filter,
      fetchData: createFetcher('events'),
      queryField: 'message',
      pullInterval: 30 * 1000,
    }),
    [table, filter],
  );
  const props = useTable(options);

  const dropdownActions = useMemo(() => {
    return actions ? [] : [EventTypesDropdownItem()];
  }, [actions]);

  return (
    <Table
      columns={[
        {
          title: translate('Message'),
          render: ({ row }) => eventsRegistry.formatEvent(row),
          export: 'message',
        },
        {
          title: translate('User'),
          render: ({ row }) =>
            row.context.user_full_name ||
            row.context.user_username || <>&mdash;</>,
          export: 'user',
          filter: 'user',
        },
        {
          title: translate('Timestamp'),
          render: EventDateField,
          orderField: 'created',
          export: 'created',
        },
      ]}
      hasQuery={true}
      title={title || translate('Events')}
      verboseName={translate('events')}
      tableActions={actions || <EventTypesButton />}
      dropdownActions={dropdownActions}
      enableExport={true}
      expandableRow={ExpandableEventDetails}
      filters={filters}
      id={id}
      initialPageSize={initialPageSize}
      className={className}
      hasActionBar={hasActionBar}
      {...props}
    />
  );
};
