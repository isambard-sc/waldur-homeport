import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { getCallStateOptions } from '../utils';

export const CallStateFilter: FunctionComponent = () => (
  <Field
    name="state"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select state...')}
        options={getCallStateOptions()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        {...REACT_MULTI_SELECT_TABLE_FILTER}
      />
    )}
  />
);
