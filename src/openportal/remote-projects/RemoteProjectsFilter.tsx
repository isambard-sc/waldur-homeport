import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { REACT_MULTI_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const STATE_CHOICES = [
  { label: translate('Pending'), value: 'pending' },
  { label: translate('Active'), value: 'active' },
  { label: translate('Stale'), value: 'stale' },
  { label: translate('Error'), value: 'error' },
  { label: translate('Deleted'), value: 'deleted' },
];

const PureRemoteProjectsFilter: FunctionComponent = () => (
  <TableFilterItem name="state" title={translate('State')} instantApply={false}>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={STATE_CHOICES}
          value={fieldProps.input.value}
          onChange={(item) => fieldProps.input.onChange(item)}
          isClearable={true}
          {...REACT_MULTI_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);

export const RemoteProjectsFilter = reduxForm({
  form: 'remoteProjectsFilter',
  initialValues: {
    // Show all non-deleted states by default so errors are visible immediately
    state: STATE_CHOICES.filter((c) => c.value !== 'deleted'),
  },
  destroyOnUnmount: false,
})(PureRemoteProjectsFilter);
