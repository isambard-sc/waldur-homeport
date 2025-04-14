import { ProviderOfferingsList } from './ProviderDashboardTab';

export const ProviderOfferingsTab = (props) => {
  return (
    <ProviderOfferingsList
      provider_uuid={props.data.provider.customer_uuid}
      initialMode="table"
    />
  );
};
