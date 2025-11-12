import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Field, formValueSelector } from 'redux-form';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

import { ENV } from '@waldur/core/config';
import { number, required, composeValidators, createProposalNameValidator, max } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { FormGroup, SelectField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { OECD_FOS_2007_CODES } from '@waldur/project/OECD_FOS_2007_CODES';
import { Call, ProposalReview } from '@waldur/proposals/types';
import { ActionButton } from '@waldur/table/ActionButton';

import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { UploadDocumentationFiles } from './UploadDocumentationFiles';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

const selector = formValueSelector('ProposalSubmissionStep');

export const ProjectDetailsStep = (props: VStepperFormStepProps) => {
  const reviews: ProposalReview[] = props.params?.reviews;
  const proposalName = useSelector((state) => selector(state, 'name')) || '';
  const projectSummary = useSelector((state) => selector(state, 'project_summary')) || '';
  const description = useSelector((state) => selector(state, 'description')) || '';

  const { data: call } = useQuery({
    queryKey: ['Call', props.params.proposal.call_uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({
        path: { uuid: props.params.proposal.call_uuid },
        query: { field: ['fixed_duration_in_days', 'backend_id', 'slug'] },
      }).then(
        (response) => response.data as Pick<Call, 'fixed_duration_in_days' | 'backend_id' | 'slug'>,
      ),

    refetchOnWindowFocus: false,
  });

  // Get call prefix (backend_id or slug)
  const callPrefix = call?.backend_id || call?.slug || '';

  // Calculate maximum allowed length for proposal name
  const maxProposalNameLength = useMemo(() => {
    if (!callPrefix) return 150 - 10 - 6; // Fallback if call data not loaded yet
    // Formula: 150 - callPrefix.length - 10 - 6
    return 150 - callPrefix.length - 10 - 6;
  }, [callPrefix]);

  // Create validator with the calculated max length
  const nameValidator = useMemo(
    () => composeValidators(required, createProposalNameValidator(callPrefix)),
    [callPrefix]
  );

  // Validators for project_summary and description (4096 character limit)
  const projectSummaryValidator = useMemo(
    () => composeValidators(required, max(4096)),
    []
  );

  const descriptionValidator = useMemo(
    () => max(4096),
    []
  );

  return (
    <VStepperFormStepCard
      title={props.title}
      id={props.id}
      actions={
        isExperimentalUiComponentsVisible() ? (
          <div className="d-flex justify-content-end flex-grow-1">
            <ActionButton
              title={translate('Import project')}
              action={null}
              iconNode={<DownloadSimpleIcon weight="bold" />}
              disabled
            />
          </div>
        ) : null
      }
    >
      <Field
        name="name"
        component={FormGroup}
        label={translate('Project title')}
        placeholder={translate('Enter a project title...')}
        tooltip={translate(
          'Short title for the project, which explains the project goal as much as possible.',
        )}
        tooltipEnd
        description={translate(
          'Maximum {maxLength} characters. Current: {current}/{maxLength}',
          {
            maxLength: maxProposalNameLength,
            current: proposalName.length,
          }
        )}
        validate={nameValidator}
        required
      >
        <StringField />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_title"
      />

      <Field
        name="project_summary"
        component={FormGroup}
        maxLength={4096}
        label={translate('Summary (public)')}
        placeholder={translate('Enter a summary that will be shown to anyone interested in your project...')}
        tooltip={translate('Brief summary of the project.')}
        tooltipEnd
        description={translate(
          '{current}/{maxLength} characters',
          {
            maxLength: 4096,
            current: projectSummary.length,
          }
        )}
        validate={projectSummaryValidator}
        required
      >
        <TextField />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_summary"
      />

      <Field
        name="description"
        component={FormGroup}
        maxLength={4096}
        label={translate('Description (private)')}
        placeholder={translate('Enter a description that will help the reviewers understand the project better...')}
        tooltip={translate(
          'Explanation of what the resources will be used to research.',
        )}
        tooltipEnd
        description={translate(
          '{current}/{maxLength} characters',
          {
            maxLength: 4096,
            current: description.length,
          }
        )}
        validate={descriptionValidator}
      >
        <TextField />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_description"
      />

      <Field
        name="project_has_civilian_purpose"
        component={FormGroup}
        hideLabel
      >
        <AwesomeCheckboxField
          label={translate('Project for civilian purpose?')}
          size="sm"
          tooltip={translate('Mark if the project has a civilian purpose.')}
          tooltipEnd
        />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_has_civilian_purpose"
      />

      {isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) ? (
        <Field
          name="oecd_fos_2007_code"
          component={FormGroup}
          label={translate('Research field (OECD code)')}
          tooltip={translate('Select the main research field for the project.')}
          tooltipEnd
          validate={isCodeRequired ? required : undefined}
          required={isCodeRequired}
        >
          <SelectField
            options={OECD_FOS_2007_CODES}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => `${option.value}. ${option.label}`}
            isClearable={true}
            simpleValue
          />
        </Field>
      ) : null}
      <Field name="project_is_confidential" component={FormGroup} hideLabel>
        <AwesomeCheckboxField
          label={translate('Is the project confidential?')}
          size="sm"
          tooltip={translate(
            'Select if the project proposal contains confidential information.',
          )}
          tooltipEnd
        />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_is_confidential"
      />

      <Field
        name="duration_in_days"
        component={FormGroup}
        label={translate('Project duration in days')}
        placeholder={translate('Enter number of days...')}
        tooltip={translate(
          'Expected project duration in days once resources have been granted. {extra_msg}',
          {
            extra_msg: call?.fixed_duration_in_days
              ? translate(
                "This field set automatically based on the call's fixed duration.",
              )
              : '',
          },
        )}
        tooltipEnd
        validate={[required, number]}
        required
      >
        <StringField disabled={!!call?.fixed_duration_in_days} />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_duration"
      />

      <Field
        name="supporting_documentation"
        className="mb-7"
        label={translate('Upload supporting documentation')}
        component={FormGroup}
        tooltip={translate(
          'Upload additional documents, which support the proposal and help to review it.',
        )}
        tooltipEnd
        required
      >
        <UploadDocumentationFiles
          proposal={props.params.proposal}
          refetch={props.params.refetch}
        />
      </Field>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_supporting_documentation"
      />
    </VStepperFormStepCard >
  );
};
