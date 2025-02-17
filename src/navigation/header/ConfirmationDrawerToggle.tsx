import { Bell } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { countOrders } from '@waldur/marketplace/common/api';
import { countProjectUpdateRequestsList } from '@waldur/marketplace-remote/api';

import {
  PENDING_CONSUMER_ORDERS_FILTER,
  PENDING_PROVIDER_ORDERS_FILTER,
} from './confirmation-drawer/constants';
import { HeaderButtonBullet } from './HeaderButtonBullet';

const PendingConfirmationContainer = lazyComponent(() =>
  import('./confirmation-drawer/PendingConfirmationContainer').then(
    (module) => ({ default: module.PendingConfirmationContainer }),
  ),
);

export const ConfirmationDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();

  const { value: counters } = useAsync(async () => {
    const pendingOrdersCount = await countOrders(
      PENDING_CONSUMER_ORDERS_FILTER,
    );
    const pendingProvidersCount = await countOrders(
      PENDING_PROVIDER_ORDERS_FILTER,
    );
    const pendingProjectUpdatesCount = await countProjectUpdateRequestsList({
      state: 'pending',
    });
    return {
      pendingOrdersCount,
      pendingProvidersCount,
      pendingProjectUpdatesCount,
    };
  });

  const showBullet = Boolean(
    counters?.pendingOrdersCount ||
      counters?.pendingProvidersCount ||
      counters?.pendingProjectUpdatesCount,
  );

  const openDrawer = () => {
    dispatch(
      openDrawerDialog(PendingConfirmationContainer, {
        title: translate('Pending confirmations'),
        props: counters,
      }),
    );
  };

  return (
    <div className="d-flex align-items-center ms-1 ms-lg-3">
      <button
        id="pending-confirmations-toggle"
        type="button"
        className="btn btn-icon btn-icon-grey-500 btn-active-secondary position-relative w-35px h-35px w-md-40px h-md-40px"
        onClick={openDrawer}
      >
        <span className="svg-icon" title={translate('Pending tasks')}>
          <Bell className="w-20px h-20px" weight="bold" />
        </span>
        {showBullet && <HeaderButtonBullet />}
      </button>
    </div>
  );
};
