import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-rancher.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const RancherProviderForm = lazyComponent(
  () => import('./RancherProviderForm'),
  'RancherProviderForm',
);

export const RancherProviderConfig: ProviderConfig = {
  name: 'Rancher',
  type: 'Rancher',
  icon,
  endpoint: 'rancher',
  component: RancherProviderForm,
};
