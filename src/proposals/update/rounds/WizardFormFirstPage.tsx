import { FunctionComponent, useMemo } from 'react';

import { formatISOWithoutZone, parseDate } from '@waldur/core/dateUtils';
import { required } from '@waldur/core/validators';
import { FormContainer, NumberField, SelectField, TextField } from '@waldur/form';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { TimezoneField } from '@waldur/form/TimezoneField';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

const MEMBERSHIP_CONTROL_CHOICES = [
  { label: translate('Open (no restriction)'), value: 'open' },
  { label: translate('Members only'), value: 'members_only' },
  { label: translate('Roles only'), value: 'roles_only' },
  { label: translate('Locked'), value: 'locked' },
];

const domainsToText = (value: unknown): string =>
  Array.isArray(value) ? (value as string[]).join('\n') : '';

const textToDomains = (text: string): string[] =>
  text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

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
            <SelectField
              label={translate('Default membership control')}
              name="default_membership_control"
              options={MEMBERSHIP_CONTROL_CHOICES}
              simpleValue
              isClearable={false}
              description={translate(
                'Default membership control policy for projects created from proposals in this round.',
              )}
            />
            <TextField
              label={translate('Default allowed domains')}
              name="default_allowed_domains"
              rows={4}
              placeholder={'@example.ac.uk\n*.bristol.ac.uk'}
              format={domainsToText}
              parse={textToDomains}
              description={translate(
                'Enter one domain pattern per line. Leave empty to allow all domains.',
              )}
            />
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
