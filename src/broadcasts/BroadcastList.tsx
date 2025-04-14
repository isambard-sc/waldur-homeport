import { FunctionComponent } from 'react';
import { BroadcastMessage } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { BroadcastCreateButton } from './BroadcastCreateButton';
import { BroadcastExpandableRow } from './BroadcastExpandableRow';
import { BroadcastsRowActions } from './BroadcastsRowActions';

const mandatoryFields = [
  'uuid',
  'author_full_name',
  'subject',
  'state',
  'created',
  'body',
  'query',
  'send_at',
];

export const BroadcastList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'broadcast',
    fetchData: createFetcher('broadcast-messages'),
    queryField: 'subject',
    mandatoryFields,
  });
  return (
    <Table<BroadcastMessage>
      {...props}
      columns={[
        {
          title: translate('Author'),
          render: ({ row }) => <>{row.author_full_name}</>,
          orderField: 'author_full_name',
        },
        {
          title: translate('Subject'),
          render: ({ row }) => <>{row.subject}</>,
          orderField: 'subject',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <StateIndicator
              label={row.state}
              variant={
                row.state === 'DRAFT'
                  ? 'default'
                  : row.state === 'SENT'
                    ? 'success'
                    : 'info'
              }
              outline
              pill
            />
          ),
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
      ]}
      verboseName={translate('broadcasts')}
      tableActions={<BroadcastCreateButton refetch={props.fetch} />}
      expandableRow={BroadcastExpandableRow}
      initialPageSize={10}
      showPageSizeSelector={true}
      expandableRowClassName="bg-gray-200"
      rowActions={BroadcastsRowActions}
      hasQuery={true}
      title={translate('Broadcasts')}
      standalone
    />
  );
};
