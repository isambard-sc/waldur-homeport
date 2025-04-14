import { openstackSnapshotsPull } from 'waldur-js-client';

import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const PullSnapshotAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(uuid: string) => openstackSnapshotsPull({ path: { uuid } })}
    resource={resource}
    refetch={refetch}
  />
);
