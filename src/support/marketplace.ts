import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

import { BASIC_OFFERING_TYPE, SUPPORT_OFFERING_TYPE } from './constants';
import { serializer } from './serializer';

const OfferingConfigurationDetails = lazyComponent(() =>
  import('@waldur/support/OfferingConfigurationDetails').then((module) => ({
    default: module.OfferingConfigurationDetails,
  })),
);
const UserPluginOptionsForm = lazyComponent(() =>
  import('@waldur/marketplace/UserPluginOptionsForm').then((module) => ({
    default: module.UserPluginOptionsForm,
  })),
);
const UserSecretOptionsForm = lazyComponent(() =>
  import('@waldur/marketplace/UserSecretOptionsForm').then((module) => ({
    default: module.UserSecretOptionsForm,
  })),
);
const ProvisioningConfigForm = lazyComponent(() =>
  import('@waldur/marketplace/ProvisioningConfigForm').then((module) => ({
    default: module.ProvisioningConfigForm,
  })),
);
const RequestOrderForm = lazyComponent(() =>
  import('./RequestOrderForm').then((module) => ({
    default: module.RequestOrderForm,
  })),
);

export const COMMON_OPTIONS = {
  orderFormComponent: RequestOrderForm,
  detailsComponent: OfferingConfigurationDetails,
  pluginOptionsForm: UserPluginOptionsForm,
  serializer,
  showComponents: true,
};

export const SupportOffering: OfferingConfiguration = {
  type: SUPPORT_OFFERING_TYPE,
  get label() {
    return translate('Service Desk');
  },
  ...COMMON_OPTIONS,
  secretOptionsForm: UserSecretOptionsForm,
  provisioningConfigForm: ProvisioningConfigForm,
};

export const BasicOffering: OfferingConfiguration = {
  type: BASIC_OFFERING_TYPE,
  get label() {
    return translate('Basic');
  },
  ...COMMON_OPTIONS,
  secretOptionsForm: UserSecretOptionsForm,
  provisioningConfigForm: ProvisioningConfigForm,
};
