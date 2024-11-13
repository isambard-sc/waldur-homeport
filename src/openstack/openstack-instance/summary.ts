import { lazyComponent } from '@waldur/core/lazyComponent';
import { ResourceSummaryConfiguration } from '@waldur/resource/summary/types';

import { INSTANCE_TYPE } from '../constants';

const OpenStackInstanceSummary = lazyComponent(() =>
  import('./OpenStackInstanceSummary').then((module) => ({
    default: module.OpenStackInstanceSummary,
  })),
);

export const OpenStackInstanceSummaryConfiguration: ResourceSummaryConfiguration =
  {
    type: INSTANCE_TYPE,
    component: OpenStackInstanceSummary,
  };
