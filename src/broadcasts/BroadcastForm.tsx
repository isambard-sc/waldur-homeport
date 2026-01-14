import { DateTime } from 'luxon';
import { useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { WizardStepIndicator } from '@waldur/form/WizardStepIndicator';
import { translate } from '@waldur/i18n';
import {
  organizationAutocomplete,
  providerOfferingsAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { AddRecipientDialog } from './AddRecipientDialog';
import { AttachmentsSection } from './AttachmentsSection';
import { templateAutocomplete } from './autocomplete';
import { RecipientsList } from './RecipientsList';
import { RoundSelector } from './RoundSelector';
import { BroadcastAttachment, MessageTemplate } from './types';

const RecipientsListQuery = () => {
  const { values } = useFormState();
  const form = useForm();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleRemoveRecipient = (email: string) => {
    const currentExcluded = values?.excluded_recipients || [];
    if (!currentExcluded.includes(email)) {
      form.change('excluded_recipients', [...currentExcluded, email]);
    }
  };

  const handleAddRecipient = (user: any) => {
    const currentAdditional = values?.additional_recipients || [];
    const alreadyAdded = currentAdditional.some((u) => u.email === user.email);
    if (!alreadyAdded) {
      form.change('additional_recipients', [...currentAdditional, user]);
    }
  };

  const handleRestoreRecipient = (email: string) => {
    const currentExcluded = values?.excluded_recipients || [];
    form.change(
      'excluded_recipients',
      currentExcluded.filter((e) => e !== email),
    );
  };

  return (
    <>
      <RecipientsList
        query={values}
        onRemoveRecipient={handleRemoveRecipient}
        onAddRecipient={() => setShowAddDialog(true)}
        onRestoreRecipient={handleRestoreRecipient}
      />
      <AddRecipientDialog
        show={showAddDialog}
        onHide={() => setShowAddDialog(false)}
        onAdd={handleAddRecipient}
      />
    </>
  );
};

export const BroadcastForm = ({
  step,
  setStep,
  broadcastUuid,
  attachments,
  onAttachmentsChange,
  broadcastState,
  onSaveDraft,
}: {
  step: number;
  setStep(step: number): void;
  broadcastUuid?: string;
  attachments?: BroadcastAttachment[];
  onAttachmentsChange?: (attachments: BroadcastAttachment[]) => void;
  broadcastState?: 'DRAFT' | 'SCHEDULED' | 'SENT';
  onSaveDraft?: () => Promise<string>;
}) => {
  const { values: formValues } = useFormState();
  const form = useForm();

  return (
    <>
      <WizardStepIndicator
        steps={[translate('Create message'), translate('Select recipients')]}
        activeStep={step}
        onSelect={setStep}
      />

      <Modal.Body className="scroll-y border-0">
        {step === 0 ? (
          <div>
            <FormGroup
              label={translate('Template')}
              help={translate('Select a pre-defined template')}
            >
              <Field
                name="template"
                component={Select as any}
                placeholder={translate('Select template...')}
                loadOptions={templateAutocomplete}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.uuid}
                noOptionsMessage={() => translate('No templates found')}
                onChange={(newValue: MessageTemplate) => {
                  if (newValue) {
                    if (
                      formValues &&
                      ((formValues.subject &&
                        formValues.subject != newValue.subject) ||
                        (formValues.body && formValues.body != newValue.body))
                    ) {
                      const response = confirm(
                        'Form is not empty. Selecting template would replace existing message. Are you sure?',
                      );
                      if (!response) {
                        return;
                      }
                    }
                    form.change('subject', newValue.subject);
                    form.change('body', newValue.body);
                  }
                }}
                isClearable={true}
              />
            </FormGroup>

            <FormGroup label={translate('Subject')} required>
              <Field
                name="subject"
                component={StringField as any}
                validate={required}
              />
            </FormGroup>

            <FormGroup label={translate('Message')} required>
              <Field
                name="body"
                component={TextField as any}
                validate={required}
              />
            </FormGroup>

            <FormGroup
              label={translate('Send at')}
              help={translate(
                'Schedule the message to be sent at a specific time',
              )}
            >
              <Field
                name="send_at"
                component={DateField as any}
                minDate={DateTime.now().plus({ days: 1 }).toISO()}
              />
            </FormGroup>

            <AttachmentsSection
              broadcastUuid={broadcastUuid}
              attachments={attachments || []}
              onAttachmentsChange={onAttachmentsChange}
              state={broadcastState}
              onSaveDraft={onSaveDraft}
            />
          </div>
        ) : (
          <Row>
            <Col
              sm={4}
              style={{
                borderRight: '2px solid #eff2f5',
                paddingRight: 20,
                marginRight: 20,
              }}
            >
              <FormGroup>
                <Field
                  name="all_users"
                  component={AwesomeCheckboxField as any}
                  label={translate('Send message to all users')}
                  hideLabel={true}
                />
              </FormGroup>

              <FormGroup
                label={translate('Offerings')}
                help={translate('Select specific offerings to target')}
              >
                <Field
                  name="offerings"
                  component={Select as any}
                  placeholder={translate('Select offerings...')}
                  loadOptions={(query, prevOptions, page) =>
                    providerOfferingsAutocomplete(
                      { name: query, shared: true },
                      prevOptions,
                      page,
                    )
                  }
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.uuid}
                  noOptionsMessage={() => translate('No offerings found')}
                  isMulti={true}
                />
              </FormGroup>

              <FormGroup
                label={translate('Organizations')}
                help={translate('Select specific organizations to target')}
              >
                <Field
                  name="customers"
                  component={Select as any}
                  placeholder={translate('Select organizations...')}
                  loadOptions={(query, prevOptions, page) =>
                    organizationAutocomplete(query, prevOptions, page, {
                      field: ['name', 'uuid'],
                      o: 'name',
                    })
                  }
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.uuid}
                  noOptionsMessage={() => translate('No organizations found')}
                  isMulti={true}
                />
              </FormGroup>

              <RoundSelector />

              <FormGroup>
                <Field
                  name="send_to_me"
                  component={AwesomeCheckboxField as any}
                  label={translate('Send message to me as well')}
                  hideLabel={true}
                />
              </FormGroup>
            </Col>
            <Col sm={7}>
              <RecipientsListQuery />
            </Col>
          </Row>
        )}
      </Modal.Body>
    </>
  );
};
