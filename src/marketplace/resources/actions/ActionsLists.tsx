import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';

const OpenStackInstanceActions = lazyComponent(() =>
  import('@waldur/openstack/openstack-instance/OpenStackInstanceActions').then(
    (module) => ({ default: module.OpenStackInstanceActions }),
  ),
);

const OpenstackVolumeActions = lazyComponent(() =>
  import('@waldur/openstack/openstack-volume/OpenStackVolumeActions').then(
    (module) => ({ default: module.OpenstackVolumeActions }),
  ),
);

const OpenstackTenantActions = lazyComponent(() =>
  import('@waldur/openstack/openstack-tenant/OpenstackTenantActions').then(
    (module) => ({ default: module.OpenstackTenantActions }),
  ),
);

const SlurmAllocationActions = lazyComponent(() =>
  import('@waldur/slurm/SlurmAllocationActions').then((module) => ({
    default: module.SlurmAllocationActions,
  })),
);

export const ActionsLists = {
  [INSTANCE_TYPE]: OpenStackInstanceActions,
  [VOLUME_TYPE]: OpenstackVolumeActions,
  [TENANT_TYPE]: OpenstackTenantActions,
  [SLURM_PLUGIN]: SlurmAllocationActions,
};
