import { Field } from 'redux-form';

import { FormGroup, TextField, StringField, NumberField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';

import { FormStepProps } from '@waldur/marketplace/deploy/types';

import { TerminationDateField } from '@waldur/marketplace/deploy/steps/TerminationDateField';

export const FormFinalConfigurationStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('Final configuration')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <Field
        name="attributes.name"
        label={translate('Name')}
        component={FormGroup}
        description={translate('This name will be visible in accounting data.')}
      >
        <StringField
          defaultValue={props.offering.name}
          placeholder={props.offering.name}
        />
      </Field>

      <Field
        name="attributes.description"
        component={FormGroup}
        maxLength={1000}
        label={translate('Description')}
      >
        <TextField />
      </Field>

      <Field
        name="attributes.allocation"
        label={translate('Initial Allocation')}
        component={FormGroup}
        description={translate(
          'If set, this will deploy an initial allocation for this resource, overriding any default allocation that is set.',
        )}
      >
        <NumberField
          min={0}
          step={1}
        />
      </Field>

      <div className="mb-7 border-bottom" />
      <TerminationDateField offering={props.offering} />
    </VStepperFormStepCard>
  );
};
