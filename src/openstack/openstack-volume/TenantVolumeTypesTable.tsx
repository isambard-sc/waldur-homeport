import { FunctionComponent, useMemo } from 'react';

import { TenantVolumeTypesList } from './TenantVolumeTypesList';

export const TenantVolumeTypesTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({ tenant_uuid: resourceScope.uuid }),
    [resourceScope],
  );

  return <TenantVolumeTypesList filter={filter} />;
};
