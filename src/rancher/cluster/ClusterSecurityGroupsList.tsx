import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { SecurityGroupRulesList } from '@waldur/openstack/openstack-security-groups/SecurityGroupRulesList';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ClusterSecurityGroupSetRulesButton } from './ClusterSecurityGroupSetRulesButton';

export const ClusterSecurityGroupsList: FunctionComponent<{
  resourceScope;
}> = ({ resourceScope }) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
    },
  ];
  const filter = useMemo(
    () => ({
      cluster_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'ClusterSecurityGroups',
    fetchData: createFetcher('rancher-cluster-security-groups'),
    filter,
  });

  return (
    <Table
      {...tableProps}
      title={translate('Security groups')}
      columns={columns}
      verboseName={translate('security groups')}
      expandableRow={SecurityGroupRulesList}
      rowActions={({ row }) => (
        <ClusterSecurityGroupSetRulesButton
          resource={row}
          refetch={tableProps.fetch}
        />
      )}
    />
  );
};
