import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const choices = [
  {
    label: translate('Organization events'),
    value: 'customers',
  },
  {
    label: translate('Project events'),
    value: 'projects',
  },
  {
    label: translate('Resource events'),
    value: 'resources',
  },
];

const PureCustomerEventsFilter: FunctionComponent = () => (
  <TableFilterItem name="feature" title={translate('Type')}>
    <Field
      name="feature"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select type...')}
          options={choices}
          value={fieldProps.input.value}
          onChange={(item) => fieldProps.input.onChange(item)}
          isClearable={true}
          {...REACT_MULTI_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const CustomerEventsFilter = reduxForm({
  form: 'customerEventsFilter',
  initialValues: {
    feature: [choices[0]],
  },
  destroyOnUnmount: false,
})(PureCustomerEventsFilter);
