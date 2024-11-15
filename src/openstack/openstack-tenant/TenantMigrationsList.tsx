import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Table, createFetcher, useTable } from '@waldur/table';

import { ExecuteMigrationAction } from './actions/ExecuteMigrationAction';
import { CreateMigrationButton } from './CreateMigrationButton';
import { DeleteMigrationAction } from './DeleteMigrationAction';
import { MigrationExpandableRow } from './MigrationExpandableRow';

export const TenantMigrationsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      src_resource_uuid: resourceScope.marketplace_resource_uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-migrations',
    fetchData: createFetcher('openstack-migrations'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Destination resource'),
          render: ({ row }) => (
            <ResourceLink
              uuid={row.dst_resource_uuid}
              label={row.dst_resource_name}
            />
          ),
        },
        {
          title: translate('Destination offering'),
          render: ({ row }) => row.dst_offering_name,
        },
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
        },
        {
          title: translate('Replication state'),
          render: ({ row }) => row.state,
        },
        {
          title: translate('Destination resource state'),
          render: ({ row }) => row.dst_resource_state,
        },
      ]}
      verboseName={translate('replications')}
      rowActions={({ row }) => (
        <>
          <ExecuteMigrationAction resource={row} refetch={props.fetch} />
          <DeleteMigrationAction resource={row} refetch={props.fetch} />
        </>
      )}
      tableActions={
        <CreateMigrationButton resource={resourceScope} refetch={props.fetch} />
      }
      expandableRow={MigrationExpandableRow}
    />
  );
};
