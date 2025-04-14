import { FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';

import { EmailsListGroup } from './EmailsListGroup';

export const EmailsListGroupWrapper = ({
  roles,
  customer,
  project,
  disabled,
}) => {
  return (
    <FieldArray
      name="rows"
      roles={roles}
      customer={customer}
      project={project}
      component={EmailsListGroup}
      validate={[required]}
      disabled={disabled}
    />
  );
};
