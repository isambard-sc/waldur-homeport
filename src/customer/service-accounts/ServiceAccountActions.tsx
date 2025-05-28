import { FC } from 'react';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { ServiceAccountDeleteAction } from './ServiceAccountDeleteAction';
import { ServiceAccountEditAction } from './ServiceAccountEditAction';
import { ServiceAccountsProps } from './type';

export const ServiceAccountActions: FC<
  ServiceAccountsProps & { row; refetch }
> = ({ context, scope, row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      data={{ context, scope }}
      actions={[ServiceAccountEditAction, ServiceAccountDeleteAction]}
      data-cy="service-account-actions-dropdown-btn"
    />
  );
};
