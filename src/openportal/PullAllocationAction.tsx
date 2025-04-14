//import { openportalAllocationsPull } from 'waldur-js-client';

import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

// dummy function
export const openportalAllocationsPull = (options: any) => {
  return new Promise((resolve) => {
    resolve({
      data: {
        uuid: options.path.uuid,
        name: options.body.name,
        description: options.body.description,
      },
    });
  });
};


export const PullAllocationAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem
    apiMethod={(id) => openportalAllocationsPull({ path: { uuid: id } })}
    resource={resource}
    refetch={refetch}
  />
);
