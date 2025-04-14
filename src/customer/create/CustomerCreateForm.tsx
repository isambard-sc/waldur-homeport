import { Field } from 'react-final-form';

import {
  composeValidators,
  email,
  getNameFieldValidators,
  required,
} from '@waldur/core/validators';
import { FormGroup } from '@waldur/form';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

export const CustomerCreateForm = () => {
  return (
    <>
      <Field
        name="name"
        component={FormGroup as any}
        label={translate('Name')}
        placeholder={translate('e.g. My Organization')}
        required
        maxLength={150}
        validate={composeValidators(...getNameFieldValidators())}
      >
        <InputField />
      </Field>
      <Field
        name="email"
        component={FormGroup as any}
        label={translate('Contact email')}
        placeholder={translate('e.g.') + ' someone@example.com'}
        type="email"
        required
        validate={composeValidators(required, email)}
      >
        <InputField />
      </Field>
    </>
  );
};
