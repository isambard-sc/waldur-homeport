import React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface ComponentAccountingTypeFieldProps {
  removeOfferingQuotas?(): void;
  disabled?: boolean;
  readOnly?: boolean;
}

export const getAccountingTypeOptions = () => [
  { label: translate('Usage-based'), value: 'usage' },
  { label: translate('Limit-based'), value: 'limit' },
  { label: translate('Fixed price'), value: 'fixed' },
  { label: translate('One-time'), value: 'one' },
  { label: translate('One-time on plan switch'), value: 'few' },
];

export const ComponentAccountingTypeField: React.FC<
  ComponentAccountingTypeFieldProps
> = (props) => (
  <FormGroup label={translate('Accounting type')} required={true}>
    <Field
      name="billing_type"
      validate={required}
      onChange={(_, newOption, prevOption) => {
        if (
          newOption &&
          prevOption &&
          newOption.value === 'usage' &&
          prevOption.value === 'fixed' &&
          props.removeOfferingQuotas
        ) {
          props.removeOfferingQuotas();
        }
      }}
      component={(fieldProps) =>
        props.readOnly ? (
          fieldProps.input.value.label
        ) : (
          <Select
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            options={getAccountingTypeOptions()}
            isClearable={false}
            isDisabled={props.disabled}
          />
        )
      }
    />
  </FormGroup>
);
