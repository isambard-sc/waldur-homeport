import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import {
  RancherCluster,
  RancherHpa,
  rancherHpasYamlRetrieve,
  rancherHpasYamlUpdate,
} from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ViewYAMLButton } from '../ViewYAMLButton';

import { HPACreateButton } from './HPACreateButton';
import { HPADeleteButton } from './HPADeleteButton';
import { HPAUpdateButton } from './HPAUpdateButton';

export const ClusterHPAList: FunctionComponent<{
  resourceScope: RancherCluster;
}> = ({ resourceScope }) => {
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );

  const props = useTable({
    table: 'rancher-hpas',
    fetchData: createFetcher('rancher-hpas'),
    filter,
  });

  return (
    <Table<RancherHpa>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{row.project_name}</>,
        },
        {
          title: translate('Namespace'),
          render: ({ row }) => <>{row.namespace_name}</>,
        },
        {
          title: translate('Workload'),
          render: ({ row }) => <>{row.workload_name}</>,
        },
        {
          title: translate('Min replicas'),
          render: ({ row }) => <>{row.min_replicas}</>,
        },
        {
          title: translate('Max replicas'),
          render: ({ row }) => <>{row.max_replicas}</>,
        },
        {
          title: translate('Current replicas'),
          render: ({ row }) => <>{row.current_replicas}</>,
        },
        {
          title: translate('Desired replicas'),
          render: ({ row }) => <>{row.desired_replicas}</>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDate(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.runtime_state}</>,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <ButtonGroup>
              <ViewYAMLButton
                yamlRetrieve={rancherHpasYamlRetrieve}
                yamlUpdate={rancherHpasYamlUpdate}
                resource={row}
              />
              <HPAUpdateButton hpa={row} />
              <HPADeleteButton hpa={row} />
            </ButtonGroup>
          ),
        },
      ]}
      verboseName={translate('horizontal pod autoscalers')}
      tableActions={<HPACreateButton cluster={resourceScope} />}
    />
  );
};
