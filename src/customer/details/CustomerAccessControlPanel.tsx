import { FunctionComponent } from 'react';

import { CustomerEditPanelProps } from '@waldur/customer/details/types';
import { FilteredEventsButton } from '@waldur/events/FilteredEventsButton';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { AccessSubnetCreateButton } from './AccessSubnetCreateButton';
import { AccessSubnetDeleteButton } from './AccessSubnetDeleteButton';
import { AccessSubnetEditButton } from './AccessSubnetEditButton';

export const CustomerAccessControlPanel: FunctionComponent<
  CustomerEditPanelProps
> = ({ customer }) => {
  const customer_uuid = customer.uuid;
  const tableProps = useTable({
    table: 'customerAccessControl',
    fetchData: createFetcher('access-subnets', {
      params: { customer_uuid },
    }),
    queryField: 'description',
  });

  return (
    <Table
      {...tableProps}
      id="access-control"
      title={translate('Access control')}
      columns={[
        {
          title: translate('CIDR'),
          render: ({ row }) => <>{row.inet}</>,
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
        },
      ]}
      verboseName={translate('Access control')}
      hasQuery
      tableActions={
        <>
          <FilteredEventsButton
            filter={{ customer_uuid, feature: 'access_subnets' }}
          />
          <AccessSubnetCreateButton
            refetch={tableProps.fetch}
            customer_url={customer.url}
          />
        </>
      }
      rowActions={({ row }) => (
        <>
          <AccessSubnetEditButton row={row} refetch={tableProps.fetch} />
          <AccessSubnetDeleteButton row={row} refetch={tableProps.fetch} />
        </>
      )}
    />
  );
};
