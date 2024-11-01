import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

import { VOLUME_TYPE } from '../constants';
const OpenStackVolumeSummary = lazyComponent(
  () => import('./OpenStackVolumeSummary'),
  'OpenStackVolumeSummary',
);

export const OpenStackVolumeSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: VOLUME_TYPE,
    component: OpenStackVolumeSummary,
  };
