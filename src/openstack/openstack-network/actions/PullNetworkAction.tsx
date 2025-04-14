import { openstackNetworksPull } from 'waldur-js-client';

import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const PullNetworkAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackNetworksPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
