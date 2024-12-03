import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { OPENPORTAL_PLUGIN } from '@waldur/openportal/constants';

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

const OpenPortalOrderForm = lazyComponent(() =>
  import('./deploy/OpenPortalOrderForm').then((module) => ({
    default: module.OpenPortalOrderForm,
  })),
);

export const OpenPortalOffering: OfferingConfiguration = {
  type: OPENPORTAL_PLUGIN,
  get label() {
    return translate('OpenPortal allocation');
  },
  orderFormComponent: OpenPortalOrderForm,
  pluginOptionsForm: UserPluginOptionsForm,
  secretOptionsForm: UserSecretOptionsForm,
  providerType: 'OpenPortal',
  allowToUpdateService: true,
  showComponents: true,
};
