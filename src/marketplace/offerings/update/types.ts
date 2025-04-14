import { ProviderOfferingDetails } from 'waldur-js-client';

export interface OfferingSectionProps {
  offering: ProviderOfferingDetails;
  refetch;
  loading;
}
