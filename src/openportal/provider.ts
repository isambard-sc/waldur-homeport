import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-openportal.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const OpenPortalForm = lazyComponent(() =>
  import('./OpenPortalForm').then((module) => ({ default: module.OpenPortalForm })),
);

export const OpenPortalProviderConfig: ProviderConfig = {
  name: 'Batch processing',
  type: 'OpenPortal',
  icon,
  component: OpenPortalForm,
};
