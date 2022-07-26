import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';
import './tabs';

const OpenStackServerGroupSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackServerGroupSummary" */ './OpenStackServerGroupSummary'
    ),
  'OpenStackServerGroupSummary',
);

ResourceSummary.register('OpenStack.ServerGroup', OpenStackServerGroupSummary);
