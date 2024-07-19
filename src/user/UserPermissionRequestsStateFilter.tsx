import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

interface Option {
  value: string;
  label: string;
}

export const getStates = (): Option[] => [
  { value: 'pending', label: translate('Pending') },
  { value: 'approved', label: translate('Approved') },
  { value: 'rejected', label: translate('Rejected') },
];

export const UserPermissionRequestsStateFilter: FunctionComponent = () => (
  <Form.Group>
    <Form.Label>{translate('State')}</Form.Label>
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={getStates()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isMulti={true}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </Form.Group>
);
