import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-openportal-remote.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const OpenPortalRemoteForm = lazyComponent(() =>
  import('./OpenPortalRemoteForm').then((module) => ({ default: module.OpenPortalRemoteForm })),
);

export const OpenPortalRemoteProviderConfig: ProviderConfig = {
  name: 'Batch processing',
  type: 'OpenPortal Remote',
  icon,
  component: OpenPortalRemoteForm,
};
