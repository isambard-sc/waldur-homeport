import { useQueryClient } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
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
import { MonacoField } from '@/form/MonacoField';
import { withFormGroup } from '@/form/withFormGroup';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

export const FORM_FLOWS_QUERY_KEY = 'FormFlows';

const MonacoGroup = withFormGroup(MonacoField);

// What a new flow starts from. The survey ID is a visible placeholder, not
// an empty string, which read as a value that could be left as it was.
export const SURVEY_ID_PLACEHOLDER = '<Formbricks survey id>';

const EXAMPLE_STEPS: FormFlowStepRequest[] = [
  {
    key: 'project_details',
    label: 'Project details',
    survey_id: SURVEY_ID_PLACEHOLDER,
    reviewer_visible: true,
    field_map: {},
  },
];

interface FormValues {
  key: string;
  name: string;
  description: string;
  steps: string;
}

/** The steps as typed, or why they cannot be read. */
export const parseSteps = (
  text: string,
): { steps?: FormFlowStepRequest[]; error?: string } => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return {
      error: translate('Not valid JSON: {message}', {
        message: (e as Error).message,
      }),
    };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: translate('Steps must be a list of at least one step.') };
  }
  // Every step names a real survey. Said here, with where to find the ID,
  // rather than left to the backend's "must be a Formbricks id".
  const unnamed = parsed.find((step) => {
    const id = typeof step?.survey_id === 'string' ? step.survey_id.trim() : '';
    return !id || id.startsWith('<');
  });
  if (unnamed) {
    return {
      error: translate(
        "Step '{step}' needs the ID of its Formbricks survey. Open the survey in Formbricks: the ID is the part of the address after /surveys/, or after /s/ in its share link (not the environment ID).",
        { step: unnamed?.key || unnamed?.label || '?' },
      ),
    };
  }
  return { steps: parsed };
};

const validateSteps = (text: string) => parseSteps(text ?? '').error;

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
 * Creates or edits a form flow: the chain of Formbricks surveys a call can
 * send applicants through.
 *
 * Steps are edited as JSON for now. The backend checks them when they are
 * saved and answers in plain words ("Step 'team': key must be a slug..."),
 * which is shown under the field it is about.
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
    steps: JSON.stringify(flow?.steps ?? EXAMPLE_STEPS, null, 2),
  };

  const submit = async (values: FormValues) => {
    const body = {
      key: values.key,
      name: values.name,
      description: values.description ?? '',
      steps: parseSteps(values.steps).steps,
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
        steps: firstMessage(errors.steps),
      };
      if (!Object.values(fieldErrors).some(Boolean)) {
        showErrorResponse(error, translate('Unable to save the form flow.'));
      }
      return { ...fieldErrors, [FORM_ERROR]: firstMessage(errors.detail) };
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
            <MonacoGroup
              name="steps"
              label={translate('Steps')}
              description={translate(
                "One entry per survey, in the order applicants answer them: key, label, survey_id, reviewer_visible, and optionally field_map and resources. survey_id is the ID in the survey's Formbricks address, after /surveys/. See the proposal forms guide for the full format.",
              )}
              validate={validateSteps}
              language="json"
              height={360}
              required
              forceTouched
            />
            {submitError && <p className="text-danger mb-0">{submitError}</p>}
          </ModalDialog>
        </form>
      )}
    />
  );
};
