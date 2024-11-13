import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-azure.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const AzureForm = lazyComponent(() =>
  import('./AzureForm').then((module) => ({ default: module.AzureForm })),
);

export const AzureProviderConfig: ProviderConfig = {
  name: 'Azure',
  type: 'Azure',
  icon,
  component: AzureForm,
};
