import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { FormGroup } from './FormGroup';

interface DisplayNameFieldProps {
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const DisplayNameField: FunctionComponent<DisplayNameFieldProps> = (
  props,
) => (
  <FormGroup
    label={translate('Display name')}
    required={true}
    description={translate('Label that is visible to users in Marketplace.')}
  >
    <Field
      component={InputField}
      name={props.name}
      type="text"
      validate={required}
      disabled={props.disabled}
      readOnly={props.readOnly}
    />
  </FormGroup>
);
