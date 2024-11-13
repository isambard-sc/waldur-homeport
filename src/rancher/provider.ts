import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-rancher.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const RancherProviderForm = lazyComponent(() =>
  import('./RancherProviderForm').then((module) => ({
    default: module.RancherProviderForm,
  })),
);

export const RancherProviderConfig: ProviderConfig = {
  name: 'Rancher',
  type: 'Rancher',
  icon,
  component: RancherProviderForm,
};
