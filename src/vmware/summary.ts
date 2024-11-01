import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const VMwareDiskSummary = lazyComponent(
  () => import('./VMwareDiskSummary'),
  'VMwareDiskSummary',
);
const VMwarePortSummary = lazyComponent(
  () => import('./VMwarePortSummary'),
  'VMwarePortSummary',
);
const VMwareVirtualMachineSummary = lazyComponent(
  () => import('./VMwareVirtualMachineSummary'),
  'VMwareVirtualMachineSummary',
);

export const VMwareVirtualMachineSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'VMware.VirtualMachine',
    component: VMwareVirtualMachineSummary,
  };

export const VMwareDiskSummaryConfiguration: ResourceSummaryConfiguration = {
  type: 'VMware.Disk',
  component: VMwareDiskSummary,
};

export const VMwarePortSummaryConfiguration: ResourceSummaryConfiguration = {
  type: 'VMware.Port',
  component: VMwarePortSummary,
};
