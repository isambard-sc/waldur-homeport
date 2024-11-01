import { ActionConfiguration } from '@waldur/resource/actions/types';

import { KubeconfigFileAction } from './KubeconfigFileAction';
import { PullClusterAction } from './PullClusterAction';

export const RancherClusterActions: ActionConfiguration = {
  type: 'Rancher.Cluster',
  actions: [KubeconfigFileAction, PullClusterAction],
};
