import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/types';

const DisksList = lazyComponent(() =>
  import('./DisksList').then((module) => ({ default: module.DisksList })),
);
const PortsList = lazyComponent(() =>
  import('./PortsList').then((module) => ({ default: module.PortsList })),
);

export const VMwareVirtualMachineTabConfiguration: ResourceTabsConfiguration = {
  type: 'VMware.VirtualMachine',
  tabs: [
    {
      title: translate('Details'),
      key: 'details',
      children: [
        {
          key: 'disks',
          title: translate('Disks'),
          component: DisksList,
        },
        {
          key: 'ports',
          title: translate('Network adapters'),
          component: PortsList,
        },
      ],
    },
  ],
};
