import { useMemo } from 'react';
import { FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { isEmailAllowed } from '@waldur/openportal/bindings/helpers';
import { useProjectEmailPolicy } from '@waldur/project/useProjectEmailPolicy';

import { EmailsListGroup } from './EmailsListGroup';

export const EmailsListGroupWrapper = ({
  roles,
  customer,
  project,
  disabled,
}) => {
  const { data: emailPolicy } = useProjectEmailPolicy(project?.uuid);

  const emailDomainValidator = useMemo(() => {
    const domains = emailPolicy?.allowed_domains;
    if (domains === undefined) return undefined;
    return (value: string) =>
      isEmailAllowed(domains, value)
        ? undefined
        : translate('This email address is not permitted for this project.');
  }, [emailPolicy]);

  return (
    <FieldArray
      name="rows"
      roles={roles}
      customer={customer}
      project={project}
      component={EmailsListGroup}
      validate={[required]}
      disabled={disabled}
      emailDomainValidator={emailDomainValidator}
    />
  );
};
