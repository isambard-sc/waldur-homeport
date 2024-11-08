import { ProviderOfferingsList } from './ProviderDashboardTab';

export const ProviderOfferingsTab = (props) => {
  return <ProviderOfferingsList items={props.offerings} initialMode="table" />;
};
