import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-openstack.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const OpenStackForm = lazyComponent(
  () => import('./OpenStackForm'),
  'OpenStackForm',
);

export const OpenStackProviderConfig: ProviderConfig = {
  name: 'OpenStack',
  type: 'OpenStack',
  icon,
  component: OpenStackForm,
};
