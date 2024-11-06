import { Field } from 'react-final-form';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { validateProjectName } from '../ProjectNameField';

export const NameGroup = ({ customer }) => (
  <FormGroup label={translate('Project name')} required controlId="name">
    <Field
      component={StringField as any}
      name="name"
      placeholder={translate('e.g. Community Health Outreach')}
      description={translate('This name will be visible in accounting data.')}
      validate={validateProjectName}
      customer={customer}
    />
  </FormGroup>
);
