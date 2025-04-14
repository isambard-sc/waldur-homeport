import { MarketplaceOrdersListData } from 'waldur-js-client';

export const PENDING_CONSUMER_ORDERS_FILTER: MarketplaceOrdersListData['query'] =
  {
    can_approve_as_consumer: true,
  };

export const PENDING_PROVIDER_ORDERS_FILTER: MarketplaceOrdersListData['query'] =
  {
    can_approve_as_provider: true,
  };
