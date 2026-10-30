import { useQueryClient } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import {
  FormFlow,
  FormFlowStepRequest,
  formFlowsCreate,
  formFlowsUpdate,
} from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { StringGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { FormFlowStepsField, StepValue, stepKeys } from './FormFlowStepsField';

export const FORM_FLOWS_QUERY_KEY = 'FormFlows';

const NEW_STEP: StepValue = {
  key: '',
  label: '',
  survey_id: null,
  reviewer_visible: true,
  isNew: true,
};

interface FormValues {
  key: string;
  name: string;
  description: string;
  steps: StepValue[];
}

/** The steps as the API takes them, keys included. */
export const toStepRequests = (steps: StepValue[]): FormFlowStepRequest[] => {
  const keys = stepKeys(steps);
  return steps.map((step, index) => ({
    key: keys[index],
    label: step.label.trim(),
    survey_id: step.survey_id,
    reviewer_visible: Boolean(step.reviewer_visible),
  }));
};

const firstMessage = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map(String).join(' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

interface FormFlowDialogProps {
  resolve: {
    /** The flow to edit; a new one when absent. */
    flow?: FormFlow;
    refetch?(): void;
  };
}

/**
 * Creates or edits a form flow: the Formbricks surveys a call asks
 * applicants to fill in beside the proposal form.
 *
 * Each step picks a survey from the Formbricks environment. A new step's key
 * comes from its label; a saved step keeps its key, since its answers are
 * stored under it. The backend checks the steps when they are saved and
 * answers in plain words, shown under the steps.
 */
export const FormFlowDialog = ({
  resolve: { flow, refetch },
}: FormFlowDialogProps) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();

  const initialValues: FormValues = {
    key: flow?.key ?? '',
    name: flow?.name ?? '',
    description: flow?.description ?? '',
    steps: flow?.steps?.length
      ? flow.steps.map((step) => ({
          key: step.key,
          label: step.label,
          survey_id: step.survey_id,
          reviewer_visible: Boolean(step.reviewer_visible),
        }))
      : [NEW_STEP],
  };

  const submit = async (values: FormValues) => {
    const body = {
      key: values.key,
      name: values.name,
      description: values.description ?? '',
      steps: toStepRequests(values.steps),
    };
    try {
      if (flow) {
        await formFlowsUpdate({ path: { uuid: flow.uuid }, body });
      } else {
        await formFlowsCreate({ body });
      }
    } catch (error) {
      const errors = getErrorBody(error) ?? {};
      const fieldErrors = {
        key: firstMessage(errors.key),
        name: firstMessage(errors.name),
        description: firstMessage(errors.description),
      };
      const stepsError = firstMessage(errors.steps);
      if (!Object.values(fieldErrors).some(Boolean) && !stepsError) {
        showErrorResponse(error, translate('Unable to save the form flow.'));
      }
      return {
        ...fieldErrors,
        [FORM_ERROR]: stepsError ?? firstMessage(errors.detail),
      };
    }
    showSuccess(
      flow
        ? translate('The form flow has been updated.')
        : translate('The form flow has been created.'),
    );
    await queryClient.invalidateQueries({ queryKey: [FORM_FLOWS_QUERY_KEY] });
    refetch?.();
    closeDialog();
  };

  return (
    <Form<FormValues>
      onSubmit={submit}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid, submitError }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={
              flow ? translate('Edit form flow') : translate('Add form flow')
            }
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  disabledReason={
                    invalid
                      ? translate('Fill in the required fields first.')
                      : undefined
                  }
                  label={translate('Save')}
                />
              </>
            }
          >
            <StringGroup
              name="name"
              label={translate('Name')}
              description={translate('Shown to call managers choosing a flow.')}
              validate={required}
              required
            />
            <StringGroup
              name="key"
              label={translate('Key')}
              description={translate(
                'A short identifier, such as airr-gateway. Used when flows are imported and exported.',
              )}
              validate={required}
              required
            />
            <TextGroup
              name="description"
              label={translate('Description')}
              rows={2}
            />
            <FormFlowStepsField />
            {submitError && <p className="text-danger mb-0">{submitError}</p>}
          </ModalDialog>
        </form>
      )}
    />
  );
};
