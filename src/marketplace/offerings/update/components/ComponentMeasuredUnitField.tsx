import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroupWithError } from '@waldur/marketplace/offerings/FormGroupWithError';

interface ComponentMeasuredUnitFieldProps {
  disabled?: boolean;
  readOnly?: boolean;
}

const componentMeasuredUnitValidator = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length > 30) {
    return translate('Ensure this field has no more than 30 characters.');
  }
};

export const ComponentMeasuredUnitField: FunctionComponent<
  ComponentMeasuredUnitFieldProps
> = ({ disabled, readOnly }) => (
  <Field
    label={translate('Measured unit')}
    name="measured_unit"
    validate={componentMeasuredUnitValidator}
    component={FormGroupWithError}
    disabled={disabled}
    readOnly={readOnly}
  />
);
