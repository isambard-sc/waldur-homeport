import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { OrganizationGroupCreateButton } from './OrganizationGroupCreateButton';
import { OrganizationGroupRowActions } from './OrganizationGroupRowActions';

export const OrganizationGroupsList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'OrganizationGroupsList',
    fetchData: createFetcher('organization-groups'),
    queryField: 'name',
  });

  return (
    <Table<OrganizationGroup>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
          copyField: (row) => row.name,
        },
        {
          title: translate('Parent group'),
          render: ({ row }) => row.parent_name || DASH_ESCAPE_CODE,
        },
        {
          title: translate('Organisations'),
          render: ({ row }) => <>{row.customers_count}</>,
          orderField: 'customers_count',
        },
      ]}
      verboseName={translate('Organization groups')}
      rowActions={OrganizationGroupRowActions}
      tableActions={
        <OrganizationGroupCreateButton refetch={tableProps.fetch} />
      }
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
    />
  );
};
