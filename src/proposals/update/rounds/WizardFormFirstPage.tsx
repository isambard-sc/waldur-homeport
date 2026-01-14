import { FunctionComponent, useMemo } from 'react';

import { formatISOWithoutZone, parseDate } from '@waldur/core/dateUtils';
import { required } from '@waldur/core/validators';
import { FormContainer, NumberField } from '@waldur/form';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { TimezoneField } from '@waldur/form/TimezoneField';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

export const WizardFormFirstPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { cutoff_time, start_time } = wizardProps.formValues;
        const duration = useMemo(() => {
          if (!start_time || !cutoff_time) return null;
          const startDate = parseDate(start_time);
          const cutoffDate = parseDate(cutoff_time);
          const diff = cutoffDate.diff(startDate, 'days').toObject().days;
          if (diff > 0) {
            return cutoffDate.toRelative({ base: startDate });
          }
          return null;
        }, [cutoff_time, start_time]);

        return (
          <FormContainer
            submitting={wizardProps.submitting}
            clearOnUnmount={false}
          >
            <TimezoneField
              label={translate('Time zone')}
              name="timezone"
              required={true}
              isSearchable={true}
              isClearable={false}
              validate={required}
            />
            <DateTimeField
              label={translate('Start date')}
              name="start_time"
              required
              validate={required}
              dateFormat="Y-m-d H:i"
              parse={(value) => (value ? formatISOWithoutZone(value) : value)}
              format={(value) => (value ? new Date(value) : value)}
            />
            <DateTimeField
              label={translate('Cutoff date')}
              name="cutoff_time"
              required
              validate={required}
              dateFormat="Y-m-d H:i"
              parse={(value) => (value ? formatISOWithoutZone(value) : value)}
              format={(value) => (value ? new Date(value) : value)}
            />
            {translate('Duration')}: {duration || '-'}
            <NumberField
              label={translate('Minimum Required Uploads')}
              name="minimum_required_uploads"
              description={translate(
                'Minimum number of documents required to submit a proposal. Set to 0 for no requirement.',
              )}
              min={0}
              step={1}
            />
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
