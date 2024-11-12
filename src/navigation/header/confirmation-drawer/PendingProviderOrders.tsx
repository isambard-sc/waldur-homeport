import React from 'react';

import { translate } from '@waldur/i18n';
import { OrderProviderActions } from '@waldur/marketplace/orders/actions/OrderProviderActions';
import { TABLE_PENDING_PROVIDER_PUBLIC_ORDERS } from '@waldur/marketplace/orders/list/constants';
import { OrderNameField } from '@waldur/marketplace/orders/list/OrderNameField';
import { OrderStateCell } from '@waldur/marketplace/orders/list/OrderStateCell';
import { OrderTablePlaceholder } from '@waldur/marketplace/orders/list/OrderTablePlaceholder';
import { OrderTypeCell } from '@waldur/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/list/ResourceNameField';
import { createFetcher, Table, useTable } from '@waldur/table';

import { BulkProviderActions } from './BulkProviderActions';
import { PENDING_PROVIDER_ORDERS_FILTER } from './constants';
import { OrderExpandableRow } from './OrderExpandableRow';

export const PendingProviderOrders: React.FC<{}> = () => {
  const tableProps = useTable({
    table: TABLE_PENDING_PROVIDER_PUBLIC_ORDERS,
    fetchData: createFetcher('marketplace-orders'),
    filter: PENDING_PROVIDER_ORDERS_FILTER,
  });

  const columns = [
    {
      title: translate('Offering'),
      render: OrderNameField,
    },
    {
      title: translate('Resource'),
      render: ResourceNameField,
    },
    {
      title: translate('Organization'),
      render: ({ row }) => <>{row.customer_name}</>,
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
    },
    {
      title: translate('Type'),
      render: OrderTypeCell,
    },
    {
      title: translate('State'),
      render: OrderStateCell,
    },
  ];

  return (
    <Table
      {...tableProps}
      placeholderComponent={<OrderTablePlaceholder />}
      columns={columns}
      title={translate('Orders')}
      verboseName={translate('Orders')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      expandableRow={OrderExpandableRow}
      tableActions={<BulkProviderActions orders={tableProps.rows} />}
      rowActions={({ row }) => (
        <OrderProviderActions order={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
