import { FunctionComponent, useMemo } from 'react';
import { OpenstackFlavorsListData } from 'waldur-js-client';

import { TenantFlavorsList } from '@waldur/openstack/openstack-tenant/TenantFlavorsList';

export const TenantFlavorsTable: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const filter = useMemo(
    (): OpenstackFlavorsListData['query'] => ({
      offering_uuid: offering.uuid,
    }),
    [offering],
  );
  return <TenantFlavorsList filter={filter} />;
};
