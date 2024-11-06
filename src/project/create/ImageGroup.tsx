import { Field } from 'react-final-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ImageGroup = ({ create }: { create?: boolean }) =>
  !create || isFeatureVisible(ProjectFeatures.show_image_in_create_dialog) ? (
    <FormGroup label={translate('Project image')}>
      <Field component={ImageField as any} name="image" />
    </FormGroup>
  ) : null;
