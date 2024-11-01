import { lazyComponent } from '@waldur/core/lazyComponent';
import { ProviderConfig } from '@waldur/marketplace/offerings/update/integration/types';

const SlurmForm = lazyComponent(() => import('./SlurmForm'), 'SlurmForm');

const SlurmRemoteForm = lazyComponent(
  () => import('./SlurmForm'),
  'SlurmRemoteForm',
);

export const SlurmProviderConfig: ProviderConfig = {
  name: 'Batch processing',
  type: 'SLURM',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmForm,
};

export const SlurmRemoteProviderConfig: ProviderConfig = {
  name: 'Batch processing (agent)',
  type: 'SLURM remote',
  icon: 'icon-slurm.png',
  endpoint: 'slurm',
  component: SlurmRemoteForm,
};
