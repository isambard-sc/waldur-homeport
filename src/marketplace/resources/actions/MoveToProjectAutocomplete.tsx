import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { required } from '@waldur/core/validators';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { moveToProjectAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface MoveToProjectAutocompleteProps {
  isDisabled: boolean;
}

export const MoveToProjectAutocomplete: FunctionComponent<
  MoveToProjectAutocompleteProps
> = ({ isDisabled }) => (
  <Form.Group>
    <Form.Label>
      {translate('Move to project')}
      <span className="text-danger"> *</span>
    </Form.Label>
    <AsyncSelectField
      name="project"
      validate={required}
      placeholder={translate('Select project...')}
      loadOptions={(query, prevOptions, { page }) =>
        moveToProjectAutocomplete(query, prevOptions, page)
      }
      getOptionValue={(option) => option.url}
      getOptionLabel={(option) => `${option.customer_name} / ${option.name}`}
      noOptionsMessage={() => translate('No projects')}
      isDisabled={isDisabled}
    />
  </Form.Group>
);
