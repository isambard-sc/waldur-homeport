import { openstackSubnetsPull } from 'waldur-js-client';

import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const PullSubnetAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackSubnetsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
