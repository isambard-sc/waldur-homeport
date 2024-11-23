import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceUsageTabsContainer } from '@waldur/marketplace/resources/usage/ResourceUsageTabsContainer';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { getComponentsAndUsages } from './api';

interface ResourceUsageDialogProps {
  resolve: {
    resource: Resource;
  };
}

export const ResourceShowUsageDialog: FunctionComponent<
  ResourceUsageDialogProps
> = ({ resolve }) => {
  const { loading, error, value } = useAsync(
    () =>
      getComponentsAndUsages(
        resolve.resource.uuid,
        null,
        null,
        resolve.resource.offering_uuid,
      ),
    [resolve],
  );

  return (
    <ModalDialog
      title={translate('Resource usage for {resourceName}', {
        resourceName: resolve.resource.name,
      })}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>
          {translate('Unable to load data')}
          <br />
          {error.message}
        </>
      ) : !value.components.length ? (
        <h3>
          {translate('Offering does not have any usage-based components.')}
        </h3>
      ) : (
        <ResourceUsageTabsContainer
          resource={{
            resource_uuid: resolve.resource.uuid,
            ...resolve.resource,
          }}
          data={value}
        />
      )}
    </ModalDialog>
  );
};
