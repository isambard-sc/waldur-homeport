import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

export const OrganizationGroup = ({ disabled }) => (
  <Form.Group className="mb-5 flex-equal">
    <Form.Label>{translate('Organization')}</Form.Label>
    <Field
      component={Select}
      name="customer"
      validate={!disabled && required}
      defaultOptions
      loadOptions={(query, prevOptions, page) =>
        organizationAutocomplete(query, prevOptions, page, {
          field: ['name', 'uuid', 'url'],
          o: 'name',
        })
      }
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.uuid}
      isDisabled={disabled}
    />
  </Form.Group>
);
