import React, { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { OrderItemDetailsLink } from '@waldur/marketplace/orders/item/details/OrderItemDetailsLink';
import { IssueLinkRenderer } from '@waldur/marketplace/orders/item/list/IssueLinkRenderer';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { OrderItemCancelButton } from './OrderItemCancelButton';
import { OrderItemStateCell } from './OrderItemStateCell';
import { OrderItemTypeCell } from './OrderItemTypeCell';

interface ResourceOrderItemsProps {
  resource_uuid: string;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('ID'),
      render: ({ row }) => (
        <OrderItemDetailsLink
          order_item_uuid={row.uuid}
          customer_uuid={row.customer_uuid}
          project_uuid={row.project_uuid}
        >
          {row.uuid}
        </OrderItemDetailsLink>
      ),
    },
    {
      title: translate('Issue link'),
      render: IssueLinkRenderer,
    },
    {
      title: translate('Type'),
      render: OrderItemTypeCell,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('State'),
      render: OrderItemStateCell,
    },
  ];

  return (
    <Table
      {...props}
      title={translate('Resource order items')}
      columns={columns}
      verboseName={translate('order items')}
      hoverableRow={OrderItemCancelButton}
      fullWidth
    />
  );
};

const mapPropsToFilter = (props: ResourceOrderItemsProps) => ({
  resource_uuid: props.resource_uuid,
  o: '-created',
});

const TableOptions = {
  table: 'ResourceOrderItems',
  fetchData: createFetcher('marketplace-order-items'),
  mapPropsToFilter,
  mapPropsToTableId: (props) => [props.resource_uuid],
};

const enhance = connectTable(TableOptions);

export const ResourceOrderItems = enhance(
  TableComponent,
) as React.ComponentType<ResourceOrderItemsProps>;
