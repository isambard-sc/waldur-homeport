import { OrderDetails } from 'waldur-js-client';

export interface OrderActionProps {
  order: OrderDetails;
  refetch?(): void;
  as?: React.ElementType;
}
