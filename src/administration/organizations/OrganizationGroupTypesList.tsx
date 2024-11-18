import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const OrganizationGroupTypesList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'OrganizationGroupTypesList',
    fetchData: createFetcher('organization-group-types'),
    queryField: 'name',
  });

  return (
    <Table<OrganizationGroup>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
      ]}
      verboseName={translate('Organization group types')}
      hasQuery={true}
    />
  );
};
