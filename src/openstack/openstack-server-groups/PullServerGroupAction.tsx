import { openstackServerGroupsPull } from 'waldur-js-client';

import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const PullServerGroupAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackServerGroupsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
