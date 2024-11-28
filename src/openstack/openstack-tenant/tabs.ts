import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/types';

const FloatingIpsList = lazyComponent(() =>
  import('../openstack-floating-ips/FloatingIpsList').then((module) => ({
    default: module.FloatingIpsList,
  })),
);
const TenantNetworksList = lazyComponent(() =>
  import('../openstack-network/TenantNetworksList').then((module) => ({
    default: module.TenantNetworksList,
  })),
);
const TenantSubnetsList = lazyComponent(() =>
  import('../openstack-subnet/TenantSubnetsList').then((module) => ({
    default: module.TenantSubnetsList,
  })),
);
const SecurityGroupsList = lazyComponent(() =>
  import('../openstack-security-groups/SecurityGroupsList').then((module) => ({
    default: module.SecurityGroupsList,
  })),
);
const ServerGroupsList = lazyComponent(() =>
  import('../openstack-server-groups/ServerGroupsList').then((module) => ({
    default: module.ServerGroupsList,
  })),
);
const TenantPortsList = lazyComponent(() =>
  import('./TenantPortsList').then((module) => ({
    default: module.TenantPortsList,
  })),
);
const TenantRoutersList = lazyComponent(() =>
  import('./TenantRoutersList').then((module) => ({
    default: module.TenantRoutersList,
  })),
);
const TenantFlavorsList = lazyComponent(() =>
  import('./TenantFlavorsList').then((module) => ({
    default: module.TenantFlavorsList,
  })),
);
const TenantInstancesList = lazyComponent(() =>
  import('./TenantInstancesList').then((module) => ({
    default: module.TenantInstancesList,
  })),
);
const TenantVolumesList = lazyComponent(() =>
  import('../openstack-volume/TenantVolumesList').then((module) => ({
    default: module.TenantVolumesList,
  })),
);
const TenantVolumeTypesList = lazyComponent(() =>
  import('../openstack-volume/TenantVolumeTypesList').then((module) => ({
    default: module.TenantVolumeTypesList,
  })),
);
const TenantSnapshotsList = lazyComponent(() =>
  import('../openstack-snapshot/TenantSnapshotsList').then((module) => ({
    default: module.TenantSnapshotsList,
  })),
);
const TenantImagesList = lazyComponent(() =>
  import('./TenantImagesList').then((module) => ({
    default: module.TenantImagesList,
  })),
);

export const OpenStackTenantTabConfiguration: ResourceTabsConfiguration = {
  type: 'OpenStack.Tenant',
  tabs: [
    {
      title: translate('Compute'),
      key: 'compute',
      children: [
        {
          key: 'instances',
          title: translate('Instances'),
          component: TenantInstancesList,
        },
        {
          key: 'flavors',
          title: translate('Flavors'),
          component: TenantFlavorsList,
        },
        {
          key: 'images',
          title: translate('Images'),
          component: TenantImagesList,
        },
        {
          key: 'server_groups',
          title: translate('Server groups'),
          component: ServerGroupsList,
        },
      ],
    },
    {
      title: translate('Networking'),
      key: 'networking',
      children: [
        {
          key: 'routers',
          title: translate('Routers'),
          component: TenantRoutersList,
        },
        {
          key: 'networks',
          title: translate('Networks'),
          component: TenantNetworksList,
        },
        {
          key: 'subnets',
          title: translate('Subnets'),
          component: TenantSubnetsList,
        },
        {
          key: 'security_groups',
          title: translate('Security groups'),
          component: SecurityGroupsList,
        },
        {
          key: 'floating_ips',
          title: translate('Floating IPs'),
          component: FloatingIpsList,
        },
        {
          key: 'ports',
          title: translate('Ports'),
          component: TenantPortsList,
        },
      ],
    },
    {
      title: translate('Storage'),
      key: 'storage',
      children: [
        {
          key: 'volumes',
          title: translate('Volumes'),
          component: TenantVolumesList,
        },
        {
          key: 'volume-types',
          title: translate('Volume types'),
          component: TenantVolumeTypesList,
        },
        {
          key: 'snapshots',
          title: translate('Snapshots'),
          component: TenantSnapshotsList,
        },
      ],
    },
  ],
};
