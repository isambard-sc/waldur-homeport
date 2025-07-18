import { FunctionComponent, useMemo } from 'react';
import { OpenstackImagesListData } from 'waldur-js-client';

import { TenantImagesList } from './TenantImagesList';

export const TenantImagesTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackImagesListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
    }),
    [resourceScope],
  );
  return <TenantImagesList filter={filter} />;
};
