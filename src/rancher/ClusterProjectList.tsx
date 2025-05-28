import { FunctionComponent, useMemo } from 'react';
import {
  RancherCluster,
  RancherProject,
  RancherProjectsListData,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ProjectExpandableRow } from './ProjectExpandableRow';

export const ClusterProjectList: FunctionComponent<
  TableWithPortal<{ resourceScope: RancherCluster }>
> = ({ resourceScope, portal }) => {
  const filter = useMemo<RancherProjectsListData['query']>(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-projects',
    fetchData: createFetcher('rancher-projects'),
    filter,
  });

  return (
    <Table<RancherProject>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
          export: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => <>{row.description}</>,
          export: 'description',
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
          export: 'runtime_state',
        },
      ]}
      verboseName={translate('projects')}
      showPageSizeSelector
      expandableRow={ProjectExpandableRow}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
