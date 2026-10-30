import { FC, useCallback } from 'react';

import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { UserUsage } from './usageStatsApi';

interface UsageByUserTableProps {
  byUser: UserUsage[];
}

// byUser is already complete in memory (part of the one usage_stats
// response), not independently paginated - fetchData just resolves it
// directly rather than calling a list endpoint, per the shared Table
// component's own convention for in-memory rows.
export const UsageByUserTable: FC<UsageByUserTableProps> = ({ byUser }) => {
  const fetchData = useCallback(
    () => Promise.resolve({ rows: byUser, resultCount: byUser.length }),
    [byUser],
  );

  const tableProps = useTable<UserUsage>({
    table: 'aiReportingUsageByUser',
    fetchData,
  });

  const columns: Column<UserUsage>[] = [
    {
      title: translate('User'),
      render: ({ row }) => (
        <>
          <span className="fw-semibold">{row.full_name || row.username}</span>{' '}
          <span className="text-muted fs-8">@{row.username}</span>
        </>
      ),
      export: 'username',
      exportTitle: translate('User'),
    },
    {
      title: translate('Requests'),
      render: ({ row }) => formatUsageValue(row.requests),
      export: 'requests',
      exportTitle: translate('Requests'),
    },
    {
      title: translate('Input tokens'),
      render: ({ row }) => formatUsageValue(row.input_tokens),
      export: 'input_tokens',
      exportTitle: translate('Input tokens'),
    },
    {
      title: translate('Output tokens'),
      render: ({ row }) => formatUsageValue(row.output_tokens),
      export: 'output_tokens',
      exportTitle: translate('Output tokens'),
    },
  ];

  return (
    <Table<UserUsage>
      {...tableProps}
      title={translate('Usage by user')}
      columns={columns}
      enableExport
    />
  );
};
