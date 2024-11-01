import { lazyComponent } from '@waldur/core/lazyComponent';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const OpenStackForm = lazyComponent(
  () => import('./OpenStackForm'),
  'OpenStackForm',
);

export const OpenStackProviderConfig: ProviderConfig = {
  name: 'OpenStack',
  type: 'OpenStack',
  icon: 'icon-openstack.png',
  endpoint: 'openstack',
  component: OpenStackForm,
};
