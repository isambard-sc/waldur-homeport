import { Field } from 'react-final-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { TextField } from '@waldur/form';
import { validateMaxLength } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const DescriptionGroup = ({ create }: { create?: boolean }) =>
  !create ||
  isFeatureVisible(ProjectFeatures.show_description_in_create_dialog) ? (
    <FormGroup
      label={translate('Project description')}
      controlId="project-description"
    >
      <Field
        component={TextField as any}
        name="description"
        placeholder={translate('Enter a description') + '...'}
        validate={validateMaxLength}
      />
    </FormGroup>
  ) : null;
