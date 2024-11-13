import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-vmware.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const VMwareForm = lazyComponent(() =>
  import('./VMwareForm').then((module) => ({ default: module.VMwareForm })),
);

export const VMwareProviderConfig: ProviderConfig = {
  name: 'VMware',
  type: 'VMware',
  icon,
  component: VMwareForm,
};
