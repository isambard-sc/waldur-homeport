import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const VMwareDiskSummary = lazyComponent(() =>
  import('./VMwareDiskSummary').then((module) => ({
    default: module.VMwareDiskSummary,
  })),
);
const VMwarePortSummary = lazyComponent(() =>
  import('./VMwarePortSummary').then((module) => ({
    default: module.VMwarePortSummary,
  })),
);
const VMwareVirtualMachineSummary = lazyComponent(() =>
  import('./VMwareVirtualMachineSummary').then((module) => ({
    default: module.VMwareVirtualMachineSummary,
  })),
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
