import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { Table, createFetcher, useTable } from '@waldur/table';

export const AllocationUsersTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      allocation_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'AllocationUsersTable',
    fetchData: createFetcher('slurm-associations'),
    filter,
  });
  return (
    <Table
      {...tableProps}
      title={translate('Allocation users')}
      columns={[
        {
          title: translate('Username'),
          render: ({ row }) => row.username,
        },
      ]}
      verboseName={translate('allocation users')}
    />
  );
};
