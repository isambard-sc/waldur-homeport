import { FunctionComponent } from 'react';
import { Form, Col } from 'react-bootstrap';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface OrganizationAutocompleteProps {
  label?: string;
  placeholder?: string;
  noOptionsMessage?: string;
  isServiceProvider?: boolean;
}

export const OrganizationAutocomplete: FunctionComponent<OrganizationAutocompleteProps> =
  (props) => (
    <Col sm={3}>
      <Form.Label>{props.label || translate('Client organization')}</Form.Label>
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={
              props.placeholder || translate('Select organization...')
            }
            loadOptions={(query, prevOptions, additional) =>
              organizationAutocomplete(
                query,
                prevOptions,
                additional,
                props.isServiceProvider,
              )
            }
            defaultOptions
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            noOptionsMessage={() =>
              props.noOptionsMessage || translate('No organizations')
            }
            isClearable={true}
            additional={{
              page: 1,
            }}
          />
        )}
      />
    </Col>
  );
