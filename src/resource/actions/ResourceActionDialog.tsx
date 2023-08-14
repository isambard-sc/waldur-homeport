import { reduxForm } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { SelectField, StringField, TextField } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CronField } from '@waldur/form/CronField';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { MonacoField } from '@waldur/form/MonacoField';
import { NumberField } from '@waldur/form/NumberField';
import { TimezoneField } from '@waldur/form/TimezoneField';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';

import { RESOURCE_ACTION_FORM } from './constants';

interface ResourceActionDialogOwnProps {
  submitForm(formData): void;
  dialogTitle: string;
  formFields?: any[];
  loading?: boolean;
  error?: Error;
}

const validateJSON = (value: string) => {
  try {
    JSON.parse(value);
  } catch (e) {
    return translate('This value is invalid JSON.');
  }
};

export const ResourceActionDialog = reduxForm<{}, ResourceActionDialogOwnProps>(
  { form: RESOURCE_ACTION_FORM },
)(
  ({
    submitForm,
    handleSubmit,
    submitting,
    invalid,
    dialogTitle,
    loading,
    error,
    formFields: fields,
  }) => {
    const getFieldComponent = (field, props) => {
      if (field.component) {
        return <field.component {...props} />;
      } else if (field.type === 'string') {
        return (
          <StringField
            {...props}
            maxLength={field.maxlength}
            pattern={field.pattern?.source}
            validate={field.validate}
            autoFocus
          />
        );
      } else if (field.type === 'text') {
        return <TextField {...props} maxLength={field.maxlength} />;
      } else if (field.type === 'json') {
        return (
          <MonacoField
            {...props}
            mode="json"
            validate={validateJSON}
            height={300}
          />
        );
      } else if (field.type === 'datetime') {
        return <DateTimeField {...props} />;
      } else if (field.type === 'timezone') {
        return <TimezoneField {...props} />;
      } else if (field.type === 'crontab') {
        return <CronField {...props} />;
      } else if (field.type === 'integer') {
        return (
          <NumberField {...props} min={field.minValue} max={field.maxValue} />
        );
      } else if (field.type === 'boolean') {
        return <AwesomeCheckboxField hideLabel={true} {...props} />;
      } else if (field.type === 'select') {
        return (
          <SelectField {...props} options={field.options} simpleValue={true} />
        );
      } else if (field.type === 'async_select') {
        return (
          <AsyncSelectField
            {...props}
            {...field.extraProps}
            loadOptions={field.loadOptions}
            getOptionLabel={field.getOptionLabel}
            getOptionValue={field.getOptionValue}
            isMulti={field.isMulti}
          />
        );
      }
    };

    return (
      <ActionDialog
        title={dialogTitle}
        submitLabel={translate('Submit')}
        onSubmit={handleSubmit(submitForm)}
        submitting={submitting}
        invalid={invalid}
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          translate('Unable to load data.')
        ) : (
          fields.map((field, index) => {
            const props = {
              key: index,
              name: field.name,
              label: field.label,
              required: field.required,
              description: field.help_text,
              disabled: field.disabled,
              disabled_tooltip: field.disabled_tooltip,
            };
            return field.disabled ? (
              <Tip
                label={props.disabled_tooltip}
                id="resource-action-dialog-disabled-tooltip"
              >
                {getFieldComponent(field, props)}
              </Tip>
            ) : (
              getFieldComponent(field, props)
            );
          })
        )}
      </ActionDialog>
    );
  },
);
