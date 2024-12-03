import { FC } from 'react';

import { Badge } from '@waldur/core/Badge';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

export const OfferingScopeState: FC<{ offering: Offering }> = (props) => {
  const variant = {
    OK: 'success',
    Erred: 'danger',
    Creating: 'warning',
    Updating: 'warning',
    Deleting: 'warning',
  };
  return (
    <FormTable.Item
      label={translate('State')}
      value={
        <Badge
          pill
          variant={variant[props.offering.scope_state] || 'secondary'}
        >
          {props.offering.scope_state.toLocaleUpperCase()}
        </Badge>
      }
    />
  );
};
