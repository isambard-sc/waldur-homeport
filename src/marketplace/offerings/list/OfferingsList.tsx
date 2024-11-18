import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { createFetcher } from '@waldur/table/api';
import { SLUG_COLUMN } from '@waldur/table/slug';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { useOfferingDropdownActions } from '../hooks';

import { CreateOfferingButton } from './CreateOfferingButton';
import { OfferingActions } from './OfferingActions';
import { OfferingNameColumn } from './OfferingNameColumn';
import { OfferingStateCell } from './OfferingStateCell';

export const BaseOfferingsList: FunctionComponent<{
  table: string;
  filter;
  hasOrganizationColumn?: boolean;
  showActions?: boolean;
  filters?;
}> = ({ table, filter, hasOrganizationColumn, showActions, filters }) => {
  const props = useTable({
    table,
    filter,
    fetchData: createFetcher('marketplace-provider-offerings'),
    queryField: 'keyword',
  });

  const organizationColumn = hasOrganizationColumn
    ? [
        {
          title: translate('Organization'),
          render: ({ row }) => renderFieldOrDash(row.customer_name),
          filter: 'organization',
          export: 'customer_name',
          keys: ['customer_name'],
          id: 'organization',
        },
      ]
    : [];

  const columns = [
    {
      title: translate('Name'),
      render: OfferingNameColumn,
      orderField: 'name',
      export: 'name',
      keys: ['name'],
      id: 'name',
    },
    ...organizationColumn,
    {
      title: translate('Category'),
      render: ({ row }) => <>{row.category_title}</>,
      filter: 'category',
      export: 'category_title',
      keys: ['category_title'],
      id: 'category',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
      keys: ['created'],
      id: 'created',
    },
    {
      title: translate('State'),
      render: OfferingStateCell,
      filter: 'state',
      export: 'state',
      keys: ['state'],
      id: 'state',
    },
    {
      title: translate('Type'),
      render: ({ row }) => <>{getLabel(row.type)}</>,
      filter: 'offering_type',
      export: (row) => getLabel(row.type),
      exportKeys: ['type'],
      keys: ['type'],
      id: 'type',
    },
    SLUG_COLUMN,
  ];

  const dropdownActions = useOfferingDropdownActions();

  return (
    <Table
      {...props}
      placeholderActions={
        showActions && <CreateOfferingButton className="w-175px mw-350px" />
      }
      columns={columns}
      verboseName={translate('Offerings')}
      dropdownActions={showActions && dropdownActions}
      initialSorting={{ field: 'created', mode: 'desc' }}
      enableExport={true}
      rowActions={
        showActions
          ? ({ row }) => <OfferingActions row={row} refetch={props.fetch} />
          : null
      }
      hasQuery={true}
      filters={filters}
      hasOptionalColumns
    />
  );
};
