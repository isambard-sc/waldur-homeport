import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { OPENPORTAL_REMOTE_PLUGIN } from '@waldur/openportal-remote/constants';

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

const OpenPortalRemoteOrderForm = lazyComponent(() =>
  import('./deploy/OpenPortalRemoteOrderForm').then((module) => ({
    default: module.OpenPortalRemoteOrderForm,
  })),
);

export const OpenPortalRemoteOffering: OfferingConfiguration = {
  type: OPENPORTAL_REMOTE_PLUGIN,
  get label() {
    return translate('OpenPortal Remote Allocation');
  },
  orderFormComponent: OpenPortalRemoteOrderForm,
  providerType: 'OpenPortal Remote',
  allowToUpdateService: true,
};
