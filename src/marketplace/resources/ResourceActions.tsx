import { useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { ModalActionsRouter } from '@waldur/marketplace/resources/actions/ModalActionsRouter';
import { ResourceActionsButton as BaseResourceActionsButton } from '@waldur/marketplace/resources/actions/ResourceActionsButton';
import { getActions } from '@waldur/resource/actions/registry';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { ActionsList } from './actions/ActionsList';
import { ActionsLists } from './actions/ActionsLists';

export const ResourceActions = ({
  resource,
  scope,
  refetch,
  labeled = false,
}) => {
  const extraActions = useMemo(() => {
    return getActions(resource.resource_type).filter(
      (action) => !ActionsList.includes(action),
    );
  }, [resource]);
  if (!scope) {
    return (
      <BaseResourceActionsButton
        resource={
          {
            ...resource,
            marketplace_resource_uuid: resource.uuid,
          } as any
        }
        refetch={refetch}
        labeled
      />
    );
  }

  if (ActionsLists[resource.offering_type]) {
    return (
      <ModalActionsRouter
        offering_type={resource.offering_type}
        url={resource.scope}
        name={resource.name}
        refetch={refetch}
        labeled={labeled}
      />
    );
  }
  return (
    <ActionsDropdownComponent label={translate('Actions')} labeled={labeled}>
      {ActionsList.map((ActionComponent, index) => (
        <ActionComponent key={index} resource={resource} refetch={refetch} />
      ))}
      {extraActions.map((ActionComponent, index) => (
        <ActionComponent
          key={index}
          resource={scope || resource}
          refetch={refetch}
        />
      ))}
    </ActionsDropdownComponent>
  );
};
