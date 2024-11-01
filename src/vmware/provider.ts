import { lazyComponent } from '@waldur/core/lazyComponent';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const VMwareForm = lazyComponent(() => import('./VMwareForm'), 'VMwareForm');

export const VMwareProviderConfig: ProviderConfig = {
  name: 'VMware',
  type: 'VMware',
  icon: 'icon-vmware.png',
  endpoint: 'vmware',
  component: VMwareForm,
};
