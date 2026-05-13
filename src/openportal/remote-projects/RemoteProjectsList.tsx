import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { openportalRemoteProjectsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getCustomer, isOwnerOrStaff, isSupport } from '@waldur/workspace/selectors';

import { RemoteProjectActions } from './RemoteProjectActions';
import { RemoteProjectStateField } from './RemoteProjectStateField';
import { RemoteProjectsFilter } from './RemoteProjectsFilter';

const mapStateToFilter = createSelector(
  getFormValues('remoteProjectsFilter'),
  getCustomer,
  (userFilter: any, customer) => {
    const filter: any = { customer_uuid: customer?.uuid };
    if (Array.isArray(userFilter?.state) && userFilter.state.length > 0) {
      filter.state = userFilter.state.map((opt) => opt.value);
    }
    return filter;
  },
);

const selectCanEdit = createSelector(
  isOwnerOrStaff,
  isSupport,
  (ownerOrStaff, support) => ownerOrStaff || support,
);

export const RemoteProjectsList = () => {
  useTitle(translate('Remote Projects'), '', 'browser');

  const filter = useSelector(mapStateToFilter);
  const canEdit = useSelector(selectCanEdit);

  const tableProps = useTable({
    table: 'RemoteProjectsList',
    fetchData: createFetcher(openportalRemoteProjectsList),
    queryField: 'query',
    filter,
  });

  const columns: Array<Column> = [
    {
      title: translate('Project'),
      orderField: 'current_project_name',
      render: ({ row }) => row.current_project_name || DASH_ESCAPE_CODE,
      keys: ['current_project_name'],
      id: 'project',
    },
    {
      title: translate('Destination'),
      orderField: 'destination',
      render: ({ row }) => row.destination || DASH_ESCAPE_CODE,
      keys: ['destination'],
      id: 'destination',
    },
    {
      title: translate('Identifier'),
      orderField: 'identifier',
      render: ({ row }) => row.identifier || DASH_ESCAPE_CODE,
      keys: ['identifier'],
      optional: true,
      id: 'identifier',
    },
    {
      title: translate('State'),
      orderField: 'state',
      render: ({ row }) =>
        row.state ? <RemoteProjectStateField state={row.state} /> : DASH_ESCAPE_CODE,
      keys: ['state'],
      id: 'state',
    },
    {
      title: translate('Current allocation'),
      render: ({ row }) => row.current_allocation ?? DASH_ESCAPE_CODE,
      keys: ['current_allocation'],
      id: 'current_allocation',
    },
    {
      title: translate('Pending allocation'),
      render: ({ row }) => row.pending_allocation ?? DASH_ESCAPE_CODE,
      keys: ['pending_allocation'],
      optional: true,
      id: 'pending_allocation',
    },
    {
      title: translate('Last contact'),
      orderField: 'last_contact_time',
      render: ({ row }) =>
        row.last_contact_time ? formatDateTime(row.last_contact_time) : DASH_ESCAPE_CODE,
      keys: ['last_contact_time'],
      optional: true,
      id: 'last_contact',
    },
    {
      title: translate('Created'),
      orderField: 'created',
      render: ({ row }) =>
        row.created ? formatDateTime(row.created) : DASH_ESCAPE_CODE,
      keys: ['created'],
      optional: true,
      id: 'created',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('remote projects')}
      title={translate('Remote Projects')}
      showPageSizeSelector={true}
      standalone
      hasQuery
      hasOptionalColumns
      rowActions={
        canEdit
          ? ({ row }) => (
              <RemoteProjectActions row={row} refetch={tableProps.fetch} />
            )
          : undefined
      }
      filters={<RemoteProjectsFilter />}
    />
  );
};
