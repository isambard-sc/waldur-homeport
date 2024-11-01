import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/types';

import { VOLUME_TYPE } from '../constants';

const SnapshotSchedulesList = lazyComponent(
  () => import('../openstack-snapshot-schedule/SnapshotSchedulesList'),
  'SnapshotSchedulesList',
);
const VolumeSnapshotsList = lazyComponent(
  () => import('./VolumeSnapshotsList'),
  'VolumeSnapshotsList',
);

export const OpenStackVolumeTabConfiguration: ResourceTabsConfiguration = {
  type: VOLUME_TYPE,
  tabs: [
    {
      title: translate('Snapshots'),
      key: 'snapshots',
      children: [
        {
          key: 'snapshots',
          title: translate('Snapshots'),
          component: VolumeSnapshotsList,
        },
        {
          key: 'snapshot_schedules',
          title: translate('Snapshot schedules'),
          component: SnapshotSchedulesList,
        },
      ],
    },
  ],
};
