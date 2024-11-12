import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { ApproveByProviderButton } from './ApproveByProviderButton';
import { OrderUnlinkButton } from './OrderUnlinkButton';
import { RejectByProviderButton } from './RejectByProviderButton';
import { OrderActionProps } from './types';

export const OrderProviderActions = ({
  order,
  refetch,
  as,
}: OrderActionProps) => {
  const user = useSelector(getUser);

  if (order.state !== 'pending-provider') {
    return null;
  }

  return as === Button ? (
    <>
      <ApproveByProviderButton row={order} refetch={refetch} as={Button} />
      <RejectByProviderButton row={order} refetch={refetch} as={Button} />
    </>
  ) : (
    <ActionsDropdown
      row={order}
      refetch={refetch}
      actions={[
        order.state === 'pending-provider' ? ApproveByProviderButton : null,
        order.state === 'pending-provider' ? RejectByProviderButton : null,
        user.is_staff ? OrderUnlinkButton : null,
      ].filter(Boolean)}
      data-cy="public-resources-list-actions-dropdown-btn"
    />
  );
};
