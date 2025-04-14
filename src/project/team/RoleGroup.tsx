import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { OptionProps, components } from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { Role, RoleType } from '@waldur/permissions/types';
import { getRoles } from '@waldur/permissions/utils';

const renderRoleType = (roleType: RoleType) =>
  ({
    customer: 'O',
    project: 'P',
    service_provider: 'SP',
    call_organizer: 'CO',
  })[roleType] || '';

const RoleOption: FunctionComponent<OptionProps<Role>> = (props) => (
  <components.Option {...props}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {props.data.description || props.data.name}
      <span
        style={{
          alignSelf: 'center',
          marginLeft: 'auto',
        }}
      >
        {renderRoleType(props.data.content_type)}
      </span>
    </div>
  </components.Option>
);

export const RoleGroup: FunctionComponent<{ types: RoleType[] }> = ({
  types,
}) => (
  <Form.Group className="mb-7">
    <Form.Label>{translate('Role')}</Form.Label>
    <Field
      name="role"
      component={SelectField}
      options={getRoles(types)}
      getOptionLabel={(role: Role) => role.description || role.name}
      getOptionValue={({ name }) => name}
      validate={[required]}
      components={{ Option: RoleOption }}
      noUpdateOnBlur
    />
  </Form.Group>
);
