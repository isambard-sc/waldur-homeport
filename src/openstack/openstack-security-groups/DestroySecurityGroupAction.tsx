import { openstackSecurityGroupsDestroy } from 'waldur-js-client';

import { DestroyActionItem } from '@waldur/resource/actions/DestroyActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

export const DestroySecurityGroupAction: ActionItemType = ({
  resource,
  refetch,
}) =>
  resource.name !== 'default' ? (
    <DestroyActionItem
      resource={resource}
      apiMethod={(id) => openstackSecurityGroupsDestroy({ path: { uuid: id } })}
      refetch={refetch}
    />
  ) : null;
