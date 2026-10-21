import { useQuery } from '@tanstack/react-query';
import {
  marketplaceProviderOfferingsRetrieve,
  marketplacePublicOfferingsRetrieve,
} from 'waldur-js-client';

export interface ResourceOption {
  key: string;
  label: string;
  help_text?: string;
  type: string;
  min?: number;
  max?: number;
  required?: boolean;
}

/** The configurable attribute fields an offering exposes, in declaration
 * order — the same shape AddResourceAdjustmentDialog and AdjustmentFormDialog
 * both render one numeric input per entry for. */
export const getResourceOptions = (offering: any): ResourceOption[] => {
  if (!offering?.resource_options?.options) return [];
  const order: string[] = offering.resource_options.order || [];
  const options = offering.resource_options.options;
  const keys = order.length > 0 ? order : Object.keys(options);
  return keys
    .filter((key) => key in options)
    .map((key) => ({
      key,
      label: options[key].label || key,
      help_text: options[key].help_text,
      type: options[key].type || 'integer',
      min: options[key].min,
      max: options[key].max,
      required: options[key].required,
    }));
};

/** Fetches an offering's full detail (needed for resource_options/
 * service_attributes) via the provider endpoint first, falling back to the
 * public one if the manager lacks provider access to it. */
export const useOfferingDetailsWithFallback = (
  offeringUuid: string | undefined,
) =>
  useQuery({
    queryKey: ['providerOffering', offeringUuid],
    queryFn: async () => {
      try {
        return (
          await marketplaceProviderOfferingsRetrieve({
            path: { uuid: offeringUuid as string },
          })
        ).data;
      } catch {
        return (
          await marketplacePublicOfferingsRetrieve({
            path: { uuid: offeringUuid as string },
          })
        ).data;
      }
    },
    enabled: !!offeringUuid,
    refetchOnWindowFocus: false,
  });
