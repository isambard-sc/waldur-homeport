import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { Table, createFetcher, useTable } from '@waldur/table';
import { renderFieldOrDash } from '@waldur/table/utils';
export const TenantVolumeTypesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({ tenant_uuid: resourceScope.uuid }),
    [resourceScope],
  );

  const props = useTable({
    table: 'openstack-volume-types',
    fetchData: createFetcher('openstack-volume-types'),
    filter,
    queryField: 'name',
  });

  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
      ]}
      hasQuery={true}
      verboseName={translate('Volume types')}
    />
  );
};
