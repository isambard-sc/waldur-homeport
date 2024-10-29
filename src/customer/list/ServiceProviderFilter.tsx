import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

const getOptions = () => [
  { value: undefined, label: translate('All') },
  { value: true, label: translate('Yes') },
  { value: false, label: translate('No') },
];

export const ServiceProviderFilter: FunctionComponent = () => (
  <Field
    name="is_service_provider"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select service provider...')}
        options={getOptions()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
