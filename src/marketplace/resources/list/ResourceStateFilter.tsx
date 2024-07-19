import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const getStates = () => [
  { value: 'Creating', label: translate('Creating') },
  { value: 'OK', label: translate('OK') },
  { value: 'Erred', label: translate('Erred') },
  { value: 'Updating', label: translate('Updating') },
  { value: 'Terminating', label: translate('Terminating') },
];

export const NON_TERMINATED_STATES = getStates().filter(
  (state) => state.value !== 'Terminated',
);

export const ResourceStateFilter: FunctionComponent<{
  reactSelectProps?: Partial<SelectProps>;
}> = (props) => (
  <Field
    name="state"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select state...')}
        options={getStates()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
        {...props.reactSelectProps}
      />
    )}
  />
);
