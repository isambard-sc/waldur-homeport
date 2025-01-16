import { startCase } from 'lodash-es';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { CustomRadioButton } from '@waldur/core/CustomRadioButton';
import { formatDate, parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { required } from '@waldur/core/validators';
import { NumberField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { BooleanField } from '@waldur/table/BooleanField';
import { renderFieldOrDash } from '@waldur/table/utils';

import { BaseCreditFormData } from './types';

export const COMMON_CREDIT_COLUMNS = [
  {
    title: translate('Eligible offerings'),
    render: ({ row }) => (
      <>
        {renderFieldOrDash(
          row.offerings.map((offering) => offering.name).join(', '),
        )}
      </>
    ),
    export: (row) =>
      renderFieldOrDash(
        row.offerings.map((offering) => offering.name).join(', '),
      ),
  },
  {
    title: translate('Minimal consumption logic'),
    render: ({ row }) => startCase(row.minimal_consumption_logic),
    export: 'minimal_consumption_logic',
  },
  {
    title: translate('Minimal consumption'),
    render: ({ row }) => defaultCurrency(row.minimal_consumption),
    export: (row) => defaultCurrency(row.minimal_consumption),
  },
  {
    title: translate('Expected consumption'),
    render: ({ row }) => defaultCurrency(row.expected_consumption),
    orderField: 'expected_consumption',
    export: (row) => defaultCurrency(row.expected_consumption),
  },
  {
    title: translate('Grace coefficient'),
    render: ({ row }) => row.grace_coefficient,
    export: 'grace_coefficient',
  },
  {
    title: translate('Apply as minimal consumption'),
    render: ({ row }) => (
      <BooleanField value={row.apply_as_minimal_consumption} />
    ),
    export: (row) => (row.apply_as_minimal_consumption ? 'Yes' : 'No'),
  },
  {
    title: translate('End date'),
    render: ({ row }) =>
      row.end_date ? formatDate(row.end_date) : <>&mdash;</>,
    orderField: 'end_date',
    export: 'end_date',
  },
  {
    title: translate('Allocated credit'),
    render: ({ row }) => defaultCurrency(row.value),
    orderField: 'value',
    export: (row) => defaultCurrency(row.value),
  },
];

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

export const useMinimalConsumptionFields = (formId: string, initialValues) => {
  const formValues = (useSelector(getFormValues(formId)) ||
    {}) as BaseCreditFormData;

  const dispatch = useDispatch();

  useEffect(() => {
    if (!initialValues?.minimal_consumption_logic) {
      dispatch(change(formId, 'minimal_consumption_logic', 'fixed'));
    }
  }, []);

  useEffect(() => {
    if (formValues.minimal_consumption_logic === 'linear') {
      if (
        formValues.end_date &&
        parseDate(formValues.end_date) < getStartOfNextMonth()
      ) {
        dispatch(change(formId, 'end_date', null));
      }
    }
  });
  return [
    <DateField
      name="end_date"
      label={translate('End date')}
      placeholder={translate('Select date') + '...'}
      description={translate('On that date all credit will be set to 0')}
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
    />,
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
    />,
    <NumberField
      label={translate('Expected consumption (per month)')}
      name="expected_consumption"
      placeholder="0"
      description={translate('Enter the expected credit reduction per month')}
      unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
    />,
    <NumberField
      label={translate('Grace coefficient')}
      name="grace_coefficient"
      placeholder="0"
      unit="%"
      validate={validatePercent}
    />,
    <AwesomeCheckboxField
      label={translate('Apply as minimal consumption')}
      name="apply_as_minimal_consumption"
      hideLabel
    />,
  ];
};
