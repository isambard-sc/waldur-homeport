import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { Customer } from '@waldur/workspace/types';

import { loadRemoteOrganizations } from './api';
import { ErredRemoteConnection } from './ErredRemoteConnection';
import { importOfferingSelector } from './selectors';

export const SelectOrganizationTab = () => {
  const formData = useSelector(importOfferingSelector);
  const {
    isLoading,
    error,
    data: organizations,
  } = useQuery<Customer[], any>(
    ['RemoteOrganizations', formData?.api_url, formData?.token],
    () => {
      if (!formData?.api_url || !formData?.token) {
        return Promise.reject(
          new Error(translate('Please check the credentials again.')),
        );
      }
      return loadRemoteOrganizations(formData);
    },
    { staleTime: 60 * 1000, retry: false },
  );

  return (
    <FormContainer
      submitting={false}
      clearOnUnmount={false}
      className="size-lg"
    >
      <SelectField
        name="customer"
        label={translate('Organization')}
        description={translate(
          'Found organizations where you are the owner in the remote waldur instance',
        )}
        isLoading={isLoading}
        options={organizations}
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        validate={required}
      />
      {isLoading ? null : error ? (
        <ErredRemoteConnection
          error={error}
          message={translate('Unable to load organizations')}
        />
      ) : organizations?.length === 0 ? (
        <p className="text-danger">
          {translate('There are no organizations yet.')}
        </p>
      ) : null}
    </FormContainer>
  );
};
