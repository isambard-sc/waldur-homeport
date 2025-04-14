import { vmwarePortsPull } from 'waldur-js-client';

import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const PullPortAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(id) => vmwarePortsPull({ path: { uuid: id } })}
    resource={resource}
    refetch={refetch}
  />
);
