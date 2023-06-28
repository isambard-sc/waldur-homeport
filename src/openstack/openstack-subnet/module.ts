import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import './actions';

const OpenStackSubNetSummary = lazyComponent(
  () => import('./OpenStackSubNetSummary'),
  'OpenStackSubNetSummary',
);

ResourceSummary.register('OpenStack.SubNet', OpenStackSubNetSummary);
