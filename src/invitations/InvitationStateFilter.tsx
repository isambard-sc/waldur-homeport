import { Field } from 'redux-form';

import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  Select,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const choices = [
  {
    label: translate('Requested'),
    value: 'requested',
  },
  {
    label: translate('Rejected'),
    value: 'rejected',
  },
  {
    label: translate('Pending'),
    value: 'pending',
  },
  {
    label: translate('Pending project start'),
    value: 'project',
  },
  {
    label: translate('Canceled'),
    value: 'canceled',
  },
  {
    label: translate('Expired'),
    value: 'expired',
  },
  {
    label: translate('Accepted'),
    value: 'accepted',
  },
];

export const formatInvitationState = (value) => {
  const choice = choices.find((choice) => choice.value === value);
  return choice ? choice.label : null;
};

export const InvitationStateFilter = () => (
  <TableFilterItem title={translate('State')} name="state">
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
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
