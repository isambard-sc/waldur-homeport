import { lazyComponent } from '@waldur/core/lazyComponent';
import icon from '@waldur/images/appstore/icon-slurm.png';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const SlurmForm = lazyComponent(() => import('./SlurmForm'), 'SlurmForm');

const SlurmRemoteForm = lazyComponent(
  () => import('./SlurmForm'),
  'SlurmRemoteForm',
);

export const SlurmProviderConfig: ProviderConfig = {
  name: 'Batch processing',
  type: 'SLURM',
  icon,
  component: SlurmForm,
};

export const SlurmRemoteProviderConfig: ProviderConfig = {
  name: 'Batch processing (agent)',
  type: 'SLURM remote',
  icon,
  component: SlurmRemoteForm,
};
