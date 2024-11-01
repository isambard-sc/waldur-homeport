import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

const AzureVirtualMachineSummary = lazyComponent(
  () => import('./AzureVirtualMachineSummary'),
  'AzureVirtualMachineSummary',
);

export const AzureVirtualMachineSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: 'Azure.VirtualMachine',
    component: AzureVirtualMachineSummary,
  };
