import { DateTime } from 'luxon';
import { Field } from 'react-final-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const StartDateGroup = ({ create }: { create?: boolean }) =>
  !create ||
  isFeatureVisible(ProjectFeatures.show_start_date_in_create_dialog) ? (
    <FormGroup
      label={translate('Start date')}
      description={translate(
        'Once start date is reached, invitations and orders are processed.',
      )}
    >
      <Field
        component={DateField}
        name="start_date"
        minDate={DateTime.now().plus({ days: 1 }).toISO()}
        containerClassName="col-lg"
      />
    </FormGroup>
  ) : null;
