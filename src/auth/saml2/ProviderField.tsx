import { createFilter } from 'react-select';
import { Field } from 'redux-form';
import { apiAuthSaml2ProvidersList } from 'waldur-js-client';

import { parseSelectData } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

const getSaml2IdentityProviders = async (
  name: string,
  prevOptions,
  currentPage: number,
) => {
  const response = await apiAuthSaml2ProvidersList({
    query: {
      name,
      page: currentPage,
      page_size: ENV.pageSize,
    },
  });
  return returnReactSelectAsyncPaginateObject(
    parseSelectData(response),
    prevOptions,
    currentPage,
  );
};

export const ProviderField = () => (
  <Field
    name="provider"
    component={(fieldProps) => (
      <AsyncPaginate
        loadOptions={(query, prevOptions, { page }) =>
          getSaml2IdentityProviders(query, prevOptions, page)
        }
        placeholder={translate('Select organization...')}
        noOptionsMessage={() => translate('No results found')}
        defaultOptions
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        value={fieldProps.input.value}
        onChange={fieldProps.input.onChange}
        filterOptions={createFilter({
          ignoreAccents: false,
        })}
      />
    )}
  />
);
