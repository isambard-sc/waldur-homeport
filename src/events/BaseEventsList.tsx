import { FunctionComponent, useMemo } from 'react';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import eventsRegistry from '@waldur/events/registry';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { EventTypesButton } from './EventTypesButton';
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
      exportFields: ['message', 'created'],
      exportRow: (row) => [row.message, row.created],
      exportKeys: ['message', 'created'],
      pullInterval: ENV.countersTimerInterval * 1000,
    }),
    [table, filter],
  );
  const props = useTable(options);

  return (
    <Table
      columns={[
        {
          title: translate('Message'),
          render: ({ row }) => eventsRegistry.formatEvent(row),
        },
        {
          title: translate('Timestamp'),
          render: EventDateField,
          orderField: 'created',
        },
      ]}
      hasQuery={true}
      title={title || translate('Events')}
      verboseName={translate('events')}
      actions={actions || <EventTypesButton />}
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
