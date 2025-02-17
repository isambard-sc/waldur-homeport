import { Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  NumberField,
  SelectField,
  StringField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { WizardStepIndicator } from '@waldur/form/WizardStepIndicator';
import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { CAMPAIGN_CREATE_FORM_ID } from '@waldur/marketplace/service-providers/constants';
import { CampaignFormData } from '@waldur/marketplace/service-providers/types';

interface OwnProps {
  submitting: boolean;
  formValues: CampaignFormData;
  step: number;
  setStep(step: number): void;
  initialValues?: any;
}

const enhance = reduxForm<CampaignFormData, OwnProps>({
  form: CAMPAIGN_CREATE_FORM_ID,
});

export const CampaignUpdateForm = enhance(({ submitting, step, setStep }) => (
  <>
    <WizardStepIndicator
      steps={[translate('Select type'), translate('Actions')]}
      activeStep={step}
      onSelect={setStep}
    />
    <form>
      <Modal.Body className="scroll-y mx-5 mx-xl-15 my-7">
        {step === 0 ? (
          <FormContainer submitting={submitting} clearOnUnmount={false}>
            <StringField
              name="name"
              label={translate('Campaign name')}
              required
              validate={required}
            />
            <SelectField
              name="discount_type"
              label={translate('Discount type')}
              required
              simpleValue
              options={[
                { label: translate('Discount'), value: 'discount' },
                {
                  label: translate('Special price'),
                  value: 'special_price',
                },
              ]}
            />
            <DateField
              name="start_date"
              label={translate('Campaign start date')}
              required
            />
            <DateField
              name="end_date"
              label={translate('Campaign end date')}
              required
            />
            <AsyncSelectField
              name="offerings"
              label={translate('Offerings')}
              placeholder={translate('Select offerings...')}
              loadOptions={(query, prevOptions, page) =>
                offeringsAutocomplete(
                  { name: query, shared: true },
                  prevOptions,
                  page,
                )
              }
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              isMulti
              required
            />
          </FormContainer>
        ) : (
          <FormContainer submitting={submitting} clearOnUnmount={false}>
            <NumberField
              name="discount"
              label={translate('Discount')}
              required
              validate={required}
              min={0}
            />
            <NumberField name="stock" label={translate('Stock')} min={0} />
            <AwesomeCheckboxField
              name="auto_apply"
              label={translate('Auto apply')}
              hideLabel
            />
          </FormContainer>
        )}
      </Modal.Body>
    </form>
  </>
));
