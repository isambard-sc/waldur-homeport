import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-azure.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const AzureForm = lazyComponent(() => import('./AzureForm'), 'AzureForm');

export const AzureProviderConfig: ProviderConfig = {
  name: 'Azure',
  type: 'Azure',
  icon,
  endpoint: 'azure',
  component: AzureForm,
};
