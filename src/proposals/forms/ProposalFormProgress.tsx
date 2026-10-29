import { CheckCircleIcon, CircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useState } from 'react';
import {
  ProposalForm,
  proposalFormsEditLinkRetrieve,
  proposalProposalsSubmit,
} from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Panel } from '@/core/Panel';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { requestListState, usesCallVocabulary } from '@/proposals/presentation';
import { ResourceRequestsSummary } from '@/proposals/proposal/create/ResourceRequestsSummary';
import { TeamSection } from '@/proposals/team/TeamSection';
import { Proposal } from '@/proposals/types';
import { useNotify } from '@/store/notify';

import { FormResponsesSection } from './FormResponsesSection';

interface ProposalFormProgressProps {
  proposal: Proposal;
  form: ProposalForm;
  /** Whether this user may submit: the proposal's creator, managers, staff. */
  canSubmit: boolean;
}

/**
 * Where an applicant fills in a draft whose call takes applications through
 * a form flow, in place of the built-in proposal form.
 *
 * The answers themselves are given in Formbricks, one survey per step; each
 * survey's ending brings the applicant back here. This page shows how far
 * they have got, sends them on to the next survey or back to change an
 * answered one, and submits once every step is answered.
 */
export const ProposalFormProgress: FC<ProposalFormProgressProps> = ({
  proposal,
  form,
  canSubmit,
}) => {
  const router = useRouter();
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const [openingStep, setOpeningStep] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = form.steps.every((step) => step.completed);
  // The backend withholds every survey link while Formbricks is switched off:
  // no next step although some are unanswered means the forms are paused.
  const paused = !allAnswered && !form.next_step;
  const started = form.steps.some((step) => step.completed);

  const openEditLink = async (stepKey: string) => {
    setOpeningStep(stepKey);
    try {
      const { data } = await proposalFormsEditLinkRetrieve({
        path: { uuid: proposal.uuid },
        query: { step: stepKey },
      });
      window.location.assign(data.survey_url);
    } catch (error) {
      showErrorResponse(error, translate('Unable to open this step.'));
      setOpeningStep(null);
    }
  };

  const submit = async () => {
    try {
      await confirm(
        translate('Confirmation'),
        usesCallVocabulary()
          ? translate('Are you sure you want to submit the proposal?')
          : translate('Are you sure you want to submit the access request?'),
      );
    } catch {
      return;
    }
    setSubmitting(true);
    try {
      await proposalProposalsSubmit({ path: { uuid: proposal.uuid } });
      showSuccess(
        usesCallVocabulary()
          ? translate('Proposal submitted successfully')
          : translate('Access request submitted successfully'),
      );
      // As the built-in form does: leave for the list rather than swap this
      // page for the read-only view under the applicant.
      router.stateService.go(requestListState());
    } catch (error) {
      showErrorResponse(error, translate('Unable to submit.'));
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body>
        <ResourceRequestsSummary proposal={proposal} />
        <TeamSection
          scope={proposal}
          roleTypes={['proposal']}
          title={translate('Project team')}
        />
        <FormResponsesSection responses={form.responses} />
      </SidebarLayout.Body>
      <SidebarLayout.Sidebar transparent>
        <Panel
          title={translate('Application form')}
          cardBordered
          className="mb-5"
        >
          <p className="text-muted mb-4">{form.flow_name}</p>
          <ol className="list-unstyled mb-5" aria-label={translate('Steps')}>
            {form.steps.map((step) => (
              <li
                key={step.key}
                className="d-flex justify-content-between align-items-start gap-2 mb-3"
              >
                <div className="d-flex gap-2">
                  {step.completed ? (
                    <CheckCircleIcon
                      weight="fill"
                      className="text-success flex-shrink-0 mt-1"
                      aria-label={translate('Answered')}
                    />
                  ) : (
                    <CircleIcon
                      weight="bold"
                      className="text-muted flex-shrink-0 mt-1"
                      aria-label={translate('Not answered yet')}
                    />
                  )}
                  <div>
                    <div>{step.label}</div>
                    {step.submitted_at && (
                      <div className="text-muted fs-7">
                        {formatDateTime(step.submitted_at)}
                      </div>
                    )}
                  </div>
                </div>
                {step.completed && !paused && (
                  <BaseButton
                    variant="text-primary"
                    size="sm"
                    pending={openingStep === step.key}
                    onClick={() => openEditLink(step.key)}
                    label={translate('Edit')}
                    aria-label={translate('Edit {step}', { step: step.label })}
                  />
                )}
              </li>
            ))}
          </ol>

          {paused ? (
            <AlertItem
              variant="warning"
              title={translate('The application form is unavailable')}
              body={translate(
                'Your answers so far are kept. Please come back later to continue.',
              )}
            />
          ) : form.next_step ? (
            <BaseButton
              variant="primary"
              className="w-100"
              onClick={() => window.location.assign(form.next_step.survey_url)}
              label={
                started
                  ? translate('Continue: {step}', {
                      step: form.next_step.step_label,
                    })
                  : translate('Start: {step}', {
                      step: form.next_step.step_label,
                    })
              }
            />
          ) : canSubmit ? (
            <>
              <p className="text-muted">
                {translate(
                  'Every step is answered. Add anyone else to the project team if needed, then submit.',
                )}
              </p>
              <BaseButton
                variant="primary"
                className="w-100"
                pending={submitting}
                onClick={submit}
                label={translate('Submit')}
              />
            </>
          ) : (
            <p className="text-muted mb-0">
              {translate(
                'Every step is answered. The proposal is submitted by its lead.',
              )}
            </p>
          )}
        </Panel>
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
