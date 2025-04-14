import { FC } from 'react';
import { MigrationDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const MigrationExpandableRow: FC<{
  row: MigrationDetails;
}> = ({ row }) => (
  <ExpandableContainer>
    {row.mappings?.subnets?.length > 0 ? (
      <>
        <strong>{translate('Subnets mapping')}</strong>
        <ul>
          {row.mappings.subnets.map((subnet, index) => (
            <li key={index}>
              {subnet.src_cidr}: {subnet.dst_cidr}
            </li>
          ))}
        </ul>
      </>
    ) : null}
    {row.mappings?.volume_types?.length > 0 ? (
      <>
        <strong>{translate('Volume types mapping')}</strong>
        <ul>
          {row.mappings.volume_types.map((volumeType, index) => (
            <li key={index}>
              {volumeType.src_type_uuid}: {volumeType.dst_type_uuid}
            </li>
          ))}
        </ul>
      </>
    ) : null}
  </ExpandableContainer>
);
