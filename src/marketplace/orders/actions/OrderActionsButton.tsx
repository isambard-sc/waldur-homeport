import { translate } from '@waldur/i18n';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { CancelOrderButton } from '../details/CancelOrderButton';

import { OrderConsumerActions } from './OrderConsumerActions';

export const OrderActionsButton = ({ order, loadData }) =>
  order.can_terminate || order.state === 'pending-consumer' ? (
    <ActionsDropdownComponent label={translate('All actions')} labeled={true}>
      {order.can_terminate && (
        <CancelOrderButton uuid={order.uuid} loadData={loadData} />
      )}
      <OrderConsumerActions order={order} />
    </ActionsDropdownComponent>
  ) : null;
