import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { VOLUME_TYPE } from '../constants';

import actions from './actions';
import './marketplace';
import './tabs';
const OpenStackVolumeSummary = lazyComponent(
  () => import('./OpenStackVolumeSummary'),
  'OpenStackVolumeSummary',
);

ResourceSummary.register(VOLUME_TYPE, OpenStackVolumeSummary);
ActionRegistry.register(VOLUME_TYPE, actions);
