import { ComponentType } from 'react';

import { CheckoutSummaryProps } from '../deploy/types';
import { OfferingEditPanelFormProps } from '../offerings/update/integration/types';
import { Offering, OfferingComponent, OrderDetailsProps } from '../types';

export type Limits = Record<string, number>;

export type LimitParser = (limits: Limits) => Limits;

export interface OfferingConfiguration<
  AttributesType = any,
  RequestPayloadType = any,
> {
  type: string;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  orderFormComponent?: ComponentType<any>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  pluginOptionsForm?: ComponentType<OfferingEditPanelFormProps>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  secretOptionsForm?: ComponentType<OfferingEditPanelFormProps>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  provisioningConfigForm?: ComponentType<OfferingEditPanelFormProps>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  detailsComponent?: ComponentType<OrderDetailsProps>;
  /**
   *  Please use only lazy component here to enable code-splitting.
   */
  checkoutSummaryComponent?: ComponentType<CheckoutSummaryProps>;
  serializer?: (
    attributes: AttributesType,
    offering: Offering,
  ) => RequestPayloadType;
  limitSerializer?: LimitParser;
  limitParser?: LimitParser;
  label: string;
  showComponents?: boolean;
  onlyOnePlan?: boolean;
  providerType?: string;
  disableOfferingCreation?: boolean;
  schedulable?: boolean;
  showBackendId?: boolean;
  allowToUpdateService?: boolean;
  offeringComponentsFilter?: (
    formData: any,
    components: OfferingComponent[],
  ) => OfferingComponent[];
}
