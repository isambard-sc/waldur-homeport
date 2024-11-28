import { FunctionComponent } from 'react';
import { useBoolean } from 'react-use';

import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceActionComponent } from '@waldur/resource/actions/ResourceActionComponent';

import { CustomerResourceActions, StaffActions } from './ActionsList';

interface ResourceActionsButtonProps {
  resource: Resource;
  refetch?(): void;
  labeled?: boolean;
}

export const ResourceActionsButton: FunctionComponent<
  ResourceActionsButtonProps
> = (props) => {
  const [open, onToggle] = useBoolean(false);

  return (
    <ResourceActionComponent
      open={open}
      onToggle={onToggle}
      customerResourceActions={CustomerResourceActions}
      staffActions={StaffActions}
      resource={props.resource}
      refetch={props.refetch}
      labeled={props.labeled}
    />
  );
};
