import { lazyComponent } from '@waldur/core/lazyComponent';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const AzureForm = lazyComponent(() => import('./AzureForm'), 'AzureForm');

export const AzureProviderConfig: ProviderConfig = {
  name: 'Azure',
  type: 'Azure',
  icon: 'icon-azure.png',
  endpoint: 'azure',
  component: AzureForm,
};
