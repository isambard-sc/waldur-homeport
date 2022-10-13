import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import { ResourceStateConfigurationProvider } from '@waldur/resource/state/ResourceStateConfiguration';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { INSTANCE_TYPE } from '../constants';

import actions from './actions';

import './marketplace';
import './tabs';

const OpenStackInstanceSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OpenStackInstanceSummary" */ './OpenStackInstanceSummary'
    ),
  'OpenStackInstanceSummary',
);

ResourceSummary.register(INSTANCE_TYPE, OpenStackInstanceSummary);
ActionRegistry.register(INSTANCE_TYPE, actions);
ResourceStateConfigurationProvider.register(INSTANCE_TYPE, {
  error_states: ['ERROR'],
  shutdown_states: ['SHUTOFF', 'STOPPED', 'SUSPENDED'],
});
