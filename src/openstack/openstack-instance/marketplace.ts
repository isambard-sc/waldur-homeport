import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

import { INSTANCE_TYPE } from '../constants';

import { instanceSerializer } from './serializers';

const OpenstackInstanceDetails = lazyComponent(
  () => import('./OpenstackInstanceDetails'),
  'OpenstackInstanceDetails',
);
const OpenstackInstanceOrder = lazyComponent(
  () => import('./OpenstackInstanceOrder'),
  'OpenstackInstanceOrder',
);
const CheckoutSummary = lazyComponent(
  () => import('./deploy/CheckoutSummary'),
  'CheckoutSummary',
);

export const OpenStackInstanceOffering: OfferingConfiguration = {
  type: INSTANCE_TYPE,
  get label() {
    return translate('OpenStack instance');
  },
  orderFormComponent: OpenstackInstanceOrder,
  detailsComponent: OpenstackInstanceDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer: instanceSerializer,
  disableOfferingCreation: true,
  allowToUpdateService: true,
};
