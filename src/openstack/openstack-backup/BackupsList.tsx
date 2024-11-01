import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, createFetcher, useTable } from '@waldur/table';

import { INSTANCE_TYPE } from '../constants';
import { CreateBackupAction } from '../openstack-instance/actions/CreateBackupAction';

export const BackupsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(() => {
    const fields = {
      [INSTANCE_TYPE]: 'instance',
      'OpenStack.BackupSchedule': 'backup_schedule',
    };
    const { resource_type, url } = resourceScope;
    const field = fields[resource_type];
    if (field) {
      return {
        [field]: url,
      };
    }
  }, [resourceScope]);
  const props = useTable({
    table: 'openstack-backups',
    fetchData: createFetcher('openstack-backups'),
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
          title: translate('Description'),
          render: ({ row }) => row.description || 'N/A',
        },
        {
          title: translate('Keep until'),
          render: ({ row }) =>
            row.kept_until
              ? formatDateTime(row.kept_until)
              : translate('Keep forever'),
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
      verboseName={translate('VM snapshots')}
      hasQuery={false}
      tableActions={<CreateBackupAction resource={resourceScope} />}
    />
  );
};
