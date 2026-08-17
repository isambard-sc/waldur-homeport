import { FunctionComponent, useMemo } from 'react';
import { Button } from 'react-bootstrap';

import {
  formatDateTime,
  formatISOWithoutZone,
  parseDate,
} from '@waldur/core/dateUtils';
import { required } from '@waldur/core/validators';
import { FormContainer, NumberField, SelectField } from '@waldur/form';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { getRoundReviewStrategyOptions } from '@waldur/proposals/utils';

export const WizardFormSecondPage: FunctionComponent<WizardFormStepProps> = (
  props,
) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { cutoff_time, review_duration_in_days, fixed_review_end_date } =
          wizardProps.formValues;
        const latestReviewDate = useMemo(() => {
          if (fixed_review_end_date) {
            return formatDateTime(parseDate(fixed_review_end_date));
          }
          if (!cutoff_time || !review_duration_in_days) return null;
          return formatDateTime(
            parseDate(cutoff_time).plus({ days: review_duration_in_days }),
          );
        }, [cutoff_time, review_duration_in_days, fixed_review_end_date]);

        return (
          <FormContainer
            submitting={wizardProps.submitting}
            clearOnUnmount={false}
          >
            <SelectField
              name="review_strategy"
              label={translate('Review strategy')}
              simpleValue={true}
              options={getRoundReviewStrategyOptions()}
              required={true}
              isClearable={false}
              validate={required}
            />
            <NumberField
              label={translate('Review duration (days)')}
              name="review_duration_in_days"
              required
              disabled={Boolean(fixed_review_end_date)}
              description={
                fixed_review_end_date
                  ? translate(
                      'Disabled while a fixed review end date is set below.',
                    )
                  : undefined
              }
              validate={required}
            />
            <NumberField
              label={translate('Minimum number of reviewers')}
              name="minimum_number_of_reviewers"
              required
              validate={required}
            />
            <DateTimeField
              label={translate('Fixed review end date')}
              name="fixed_review_end_date"
              description={translate(
                'Optional. Sets the same review deadline for every reviewer in this round, overriding the review duration above.',
              )}
              placeholder={translate('Not set')}
              dateFormat="Y-m-d H:i"
              parse={(value) => (value ? formatISOWithoutZone(value) : value)}
              format={(value) => (value ? new Date(value) : value)}
            />
            {fixed_review_end_date && (
              <Button
                variant="link"
                type="button"
                className="p-0 mb-7"
                onClick={() =>
                  wizardProps.change('fixed_review_end_date', null)
                }
              >
                {translate('Clear end date')}
              </Button>
            )}
            {translate('Latest review completion date')}: {latestReviewDate}
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
