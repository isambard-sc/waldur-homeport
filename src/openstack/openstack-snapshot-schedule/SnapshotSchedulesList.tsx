import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { formatCrontab } from '@waldur/resource/crontab';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { useTable } from '@waldur/table/utils';

import { CreateSnapshotScheduleAction } from '../openstack-volume/actions/CreateSnapshotScheduleAction';

export const SnapshotSchedulesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      source_volume: resourceScope.url,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-snapshot-schedules',
    fetchData: createFetcher('openstack-snapshot-schedules'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
          copyField: (row) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Max number of VM snapshots'),
          render: ({ row }) => row.maximal_number_of_resources || 'N/A',
        },
        {
          title: translate('Schedule'),
          render: ({ row }) => formatCrontab(row.schedule),
        },
        {
          title: translate('Is active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <ResourceRowActions resource={row} refetch={props.fetch} />
          ),
        },
      ]}
      verboseName={translate('snapshot schedules')}
      hasQuery={false}
      tableActions={
        <CreateSnapshotScheduleAction
          resource={resourceScope}
          refetch={props.fetch}
        />
      }
    />
  );
};
