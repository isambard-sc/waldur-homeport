import React from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';
import { Project } from 'waldur-js-client';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { categoryAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { Customer } from '@waldur/workspace/types';

export const CategoryFilter: React.FC<{
  reactSelectProps?: Partial<SelectProps>;
  project?: Project;
  customer?: Customer;
}> = (props) => (
  <Field
    name="category"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select category...')}
        loadOptions={(query: string, prevOptions, { page }) =>
          categoryAutocomplete(
            query,
            prevOptions,
            { page },
            {
              resource_customer_uuid: props.customer?.uuid,
              resource_project_uuid: props.project?.uuid,
            },
          )
        }
        defaultOptions
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.title}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No categories')}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
        {...props.reactSelectProps}
      />
    )}
  />
);
