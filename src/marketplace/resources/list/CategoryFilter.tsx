import React from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { categoryAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const CategoryFilter: React.FC<{
  reactSelectProps?: Partial<SelectProps>;
}> = (props) => (
  <Field
    name="category"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={translate('Select category...')}
        loadOptions={categoryAutocomplete}
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
