import { FunctionComponent } from 'react';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

const checkPattern = (value: string) => {
  if (!value) {
    return translate('Short name is required field.');
  }
  const length = value.trim().length;
  if (length < 3) {
    return translate('Name should contain at least 3 symbols.');
  }
  if (length > 30) {
    return translate('Must be 30 characters or less.');
  }
};

const checkDuplicate = (value, props) =>
  props.customer?.projects.find(
    (project) =>
      project.short_name === value && project.uuid !== props.project_uuid,
  )
    ? translate('Name is duplicated. Choose other name.')
    : undefined;

const validateProjectShortName = (value, _, props) =>
  checkDuplicate(value, props) || checkPattern(value);

interface ProjectShortNameFieldProps {
  isDisabled?: boolean;
  customer?;
}

export const ProjectShortNameField: FunctionComponent<
  ProjectShortNameFieldProps
> = ({ isDisabled = false }) => (
  <StringField
    label={translate('Project short name')}
    name="short_name"
    description={translate(
      'This name will be used in UNIX accounts and similar. It cannot be changed later. It can only contain lower-case letters, numbers, hyphens and underscores.',
    )}
    required={true}
    validate={validateProjectShortName}
    disabled={isDisabled}
  />
);
