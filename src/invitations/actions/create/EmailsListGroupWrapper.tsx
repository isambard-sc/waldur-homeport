import { useMemo } from 'react';
import { FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { isEmailAllowed } from '@waldur/openportal/bindings/helpers';
import { useProjectEmailPolicy } from '@waldur/project/useProjectEmailPolicy';

import { EmailsListGroup } from './EmailsListGroup';

export const EmailsListGroupWrapper = ({
  roles,
  customer,
  project,
  disabled,
}) => {
  const featureEnabled = isFeatureVisible(ProjectFeatures.enforce_allowed_domains);
  console.log('[EmailsListGroupWrapper] project uuid:', project?.uuid);
  console.log('[EmailsListGroupWrapper] enforce_allowed_domains feature enabled:', featureEnabled);

  const { data: emailPolicy, isLoading, error } = useProjectEmailPolicy(project?.uuid);
  console.log('[EmailsListGroupWrapper] emailPolicy loading:', isLoading, 'error:', error, 'data:', emailPolicy);

  const emailDomainValidator = useMemo(() => {
    const domains = emailPolicy?.allowed_domains;
    console.log('[EmailsListGroupWrapper] allowed_domains:', domains, '(undefined = policy not loaded, null = all allowed, [] = none allowed)');
    if (domains === undefined) return undefined;
    return (value: string) => {
      const allowed = isEmailAllowed(domains, value);
      console.log('[EmailsListGroupWrapper] isEmailAllowed(', domains, ',', value, ') =', allowed);
      return allowed
        ? undefined
        : translate('This email address is not permitted for this project.');
    };
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
