import { lazyComponent } from '@waldur/core/lazyComponent';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const RancherProviderForm = lazyComponent(
  () => import('./RancherProviderForm'),
  'RancherProviderForm',
);

export const RancherProviderConfig: ProviderConfig = {
  name: 'Rancher',
  type: 'Rancher',
  icon: 'icon-rancher.png',
  endpoint: 'rancher',
  component: RancherProviderForm,
};
