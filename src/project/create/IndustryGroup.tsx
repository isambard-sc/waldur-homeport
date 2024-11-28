import { Field } from 'react-final-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

export const IndustryGroup = () =>
  isFeatureVisible(ProjectFeatures.show_industry_flag) ? (
    <Field
      component={AwesomeCheckboxField as any}
      name="is_industry"
      label={translate('Please mark if project is aimed at industrial use')}
    />
  ) : null;
