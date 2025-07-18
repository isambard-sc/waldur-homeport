import { FunctionComponent, useMemo } from 'react';
import { OpenstackFlavorsListData } from 'waldur-js-client';

import { TenantFlavorsList } from './TenantFlavorsList';

export const TenantFlavorsTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackFlavorsListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  return <TenantFlavorsList filter={filter} />;
};
