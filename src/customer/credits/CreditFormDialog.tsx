import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { Form, Accordion } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues, reduxForm, formValueSelector } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { CustomRadioButton } from '@waldur/core/CustomRadioButton';
import { parseDate } from '@waldur/core/dateUtils';
import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import {
  FieldError,
  FormContainer,
  NumberField,
  SubmitButton,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import {
  offeringsAutocomplete,
  organizationAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

import { getCustomerCostChartData } from '../dashboard/api';

import { CustomerCreditFormData } from './types';

const getStartOfNextMonth = () =>
  DateTime.now().plus({ months: 1 }).startOf('month');

const validatePercent = (value) => {
  if (!value) {
    return undefined;
  }
  const valueAsNumber = Number(value);
  if (isNaN(valueAsNumber)) {
    return translate('Must be a number');
  }
  if (valueAsNumber < 0) {
    return translate('Must be greater than or equal to 0');
  }
  if (valueAsNumber > 100) {
    return translate('Must be less than or equal to 100');
  }
  return undefined;
};

interface CreditFormDialogProps {
  onSubmit(formData: CustomerCreditFormData): void;
}

export const CreditFormDialog = reduxForm<
  CustomerCreditFormData,
  CreditFormDialogProps
>({
  destroyOnUnmount: true,
})((props) => {
  const isEdit = Boolean(props.initialValues);

  const formValues = (useSelector(getFormValues(props.form)) ||
    {}) as CustomerCreditFormData;

  useEffect(() => {
    if (!props.initialValues?.minimal_consumption_logic) {
      props.change('minimal_consumption_logic', 'fixed');
    }
  }, []);

  useEffect(() => {
    if (formValues.minimal_consumption_logic === 'linear') {
      if (
        formValues.end_date &&
        parseDate(formValues.end_date) < getStartOfNextMonth()
      ) {
        props.change('end_date', null);
      }
    }
  });

  const customer = useSelector((state) =>
    formValueSelector(props.form)(state, 'customer'),
  );
  const { data, isLoading, error, refetch } = useQuery(
    ['customerDashboardCharts', customer?.uuid, true],
    () =>
      isEdit && customer ? getCustomerCostChartData(customer, true) : null,
    { staleTime: 5 * 60 * 1000 },
  );

  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <MetronicModalDialog
        title={
          isEdit ? translate('Edit credit') : translate('Add allocation credit')
        }
        subtitle={
          isEdit
            ? translate(
                'Assign a credit limit for this organization and group of offerings.',
              )
            : translate(
                'Assign a credit limit within selected organization. Select the offerings that will use the allocated credits, ensuring the total does not exceed the available organizational credit.',
              )
        }
        footer={
          <>
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              disabled={props.invalid || !props.dirty}
              submitting={props.submitting}
              label={isEdit ? translate('Confirm') : translate('Create')}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting} className="size-lg">
          <AsyncSelectField
            name="customer"
            label={translate('Organization')}
            validate={required}
            required
            loadOptions={(query, prevOptions, { page }) =>
              organizationAutocomplete(query, prevOptions, page, {
                field: ['name', 'uuid', 'url'],
              })
            }
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.name}
            noOptionsMessage={() => translate('No organizations')}
            isDisabled={isEdit}
          />
          {isEdit && (
            <Accordion className="mb-7">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div className="fw-bolder">
                    {translate('Organization invoice history')}
                    {isLoading && <LoadingSpinnerIcon className="ms-2" />}
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  {error ? (
                    <LoadingErred loadData={refetch} />
                  ) : data?.options ? (
                    <>
                      <div className="fw-bold text-muted text-end">
                        {translate('Total for the year')}
                        {': '}
                        {defaultCurrency(data.chart.total)}
                      </div>
                      <EChart options={data.options} height="150px" />
                    </>
                  ) : null}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          )}
          <AsyncSelectField
            name="offerings"
            label={translate('Offering(s)')}
            placeholder={translate('All')}
            loadOptions={(query, prevOptions, { page }) =>
              offeringsAutocomplete(
                { name: query, billable: true },
                prevOptions,
                page,
              )
            }
            isMulti
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) =>
              option.category_title
                ? `${option.category_title} / ${option.name}`
                : option.name
            }
            noOptionsMessage={() => translate('No offerings')}
          />
          <NumberField
            label={translate('Allocate credit ({currency})', {
              currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
            })}
            name="value"
            placeholder="0"
            validate={required}
            required
            unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
          />
          <DateField
            name="end_date"
            label={translate('End date')}
            placeholder={translate('Select date') + '...'}
            description={
              !isEdit && translate('On that date all credit will be set to 0')
            }
            required={formValues.minimal_consumption_logic === 'linear'}
            validate={
              formValues.minimal_consumption_logic === 'linear'
                ? [required]
                : undefined
            }
            minDate={
              formValues.minimal_consumption_logic === 'linear'
                ? getStartOfNextMonth().toISO()
                : undefined
            }
          />
          <CustomRadioButton
            label={translate('Minimal consumption logic')}
            name="minimal_consumption_logic"
            direction="horizontal"
            choices={[
              {
                label: translate('Fixed'),
                value: 'fixed',
                description: translate(
                  'A minimal guaranteed credit reduction per month.',
                ),
              },
              {
                label: translate('Linear'),
                value: 'linear',
                description: translate(
                  'A minimum amount deducted monthly, calculated based on the end date. Updated on the start of the month.',
                ),
              },
            ]}
          />
          <NumberField
            label={translate('Expected consumption (per month)')}
            name="expected_consumption"
            placeholder="0"
            description={translate(
              'Enter the expected credit reduction per month',
            )}
            unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
          />
          <NumberField
            label={translate('Grace coefficient')}
            name="grace_coefficient"
            placeholder="0"
            unit="%"
            validate={validatePercent}
          />
          <AwesomeCheckboxField
            label={translate('Apply as minimal consumption')}
            name="apply_as_minimal_consumption"
            hideLabel
          />
          <Form.Group>
            <FieldError error={props.error} />
          </Form.Group>
        </FormContainer>
      </MetronicModalDialog>
    </form>
  );
});
