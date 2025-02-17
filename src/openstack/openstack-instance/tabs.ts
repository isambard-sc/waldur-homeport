import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/types';

import { INSTANCE_TYPE } from '../constants';

const BackupsSchedulesList = lazyComponent(() =>
  import('../openstack-backup-schedule/BackupSchedulesList').then((module) => ({
    default: module.BackupsSchedulesList,
  })),
);
const BackupsList = lazyComponent(() =>
  import('../openstack-backup/BackupsList').then((module) => ({
    default: module.BackupsList,
  })),
);
const InstanceVolumesList = lazyComponent(() =>
  import('../openstack-volume/InstanceVolumesList').then((module) => ({
    default: module.InstanceVolumesList,
  })),
);
const InternalIpsList = lazyComponent(() =>
  import('./InternalIpsList').then((module) => ({
    default: module.InternalIpsList,
  })),
);
const FloatingIpsList = lazyComponent(() =>
  import('./FloatingIpsList').then((module) => ({
    default: module.FloatingIpsList,
  })),
);
const OpenStackSecurityGroupsList = lazyComponent(() =>
  import('./OpenStackSecurityGroupsList').then((module) => ({
    default: module.OpenStackSecurityGroupsList,
  })),
);

export const OpenStackInstanceTabConfiguration: ResourceTabsConfiguration = {
  type: INSTANCE_TYPE,
  tabs: [
    {
      title: translate('Networking'),
      key: 'networking',
      children: [
        {
          key: 'ports',
          title: translate('Internal IPs'),
          component: InternalIpsList,
        },
        {
          key: 'floating_ips',
          title: translate('Floating IPs'),
          component: FloatingIpsList,
        },
        {
          key: 'security_groups',
          title: translate('Security groups'),
          component: OpenStackSecurityGroupsList,
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
          component: InstanceVolumesList,
        },
        {
          key: 'backups',
          title: translate('Snapshots'),
          component: BackupsList,
        },
        {
          key: 'backup_schedules',
          title: translate('Snapshot schedules'),
          component: BackupsSchedulesList,
        },
      ],
    },
  ],
};
