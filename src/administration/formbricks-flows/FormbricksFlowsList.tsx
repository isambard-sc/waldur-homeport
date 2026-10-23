import { FormbricksFlow, proposalFormbricksFlowsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { FormbricksFlowActions } from './FormbricksFlowActions';
import { FormbricksFlowCreateButton } from './FormbricksFlowCreateButton';
import { FormbricksFlowExpandableRow } from './FormbricksFlowExpandableRow';

export const FormbricksFlowsList = () => {
  const tableProps = useTable({
    table: 'FormbricksFlowsList',
    fetchData: createFetcher(proposalFormbricksFlowsList),
  });

  return (
    <Table<FormbricksFlow>
      {...tableProps}
      title={translate('Formbricks flows')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          title: translate('Steps'),
          render: ({ row }) => <>{row.steps.length}</>,
        },
        {
          title: translate('Calls'),
          render: ({ row }) => <>{row.calls_count}</>,
        },
        {
          title: translate('Modified'),
          render: ({ row }) => <>{formatDateTime(row.modified)}</>,
        },
      ]}
      verboseName={translate('Formbricks flows')}
      rowActions={({ row }) => (
        <FormbricksFlowActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={<FormbricksFlowCreateButton refetch={tableProps.fetch} />}
      expandableRow={FormbricksFlowExpandableRow}
    />
  );
};
