import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import {
  proposalProposalsFormbricksEditLinkRetrieve,
  proposalProposalsFormbricksProgressRetrieve,
  proposalProposalsSubmit,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import {
  FormResponsesSection,
  STEP_LABELS,
} from '@/proposals/proposal/FormResponsesSection';
import { TeamSection } from '@/proposals/team/TeamSection';
import { Proposal } from '@/proposals/types';
import { useNotify } from '@/store/notify';

import { ResourceRequestsSummary } from './ResourceRequestsSummary';

interface FormbricksProposalProgressProps {
  proposal: Proposal;
  refetch?(): void;
}

// Neither action below has a declared response serializer (see
// ProposalViewSet.formbricks_progress/formbricks_edit_link in views.py),
// so drf-spectacular can't type their bodies - these describe what they
// actually return.
interface FormbricksProgressResponse {
  completed_steps: string[];
  next_step: { key: string; redirect_url: string } | null;
}

interface FormbricksEditLinkResponse {
  redirect_url: string;
}

/** Draft-stage landing page for a Formbricks-driven proposal - shown
 * instead of the native ProposalSubmissionStep wizard while
 * proposal.state === 'draft' for calls with call.formbricks_flow set.
 * Tracking is at step granularity, not sub-step: a step only shows as
 * completed once Formbricks has actually finished it (a FormStepResponse
 * row exists server-side) - a Lead who started but didn't submit a step
 * gets sent back to a fresh copy of that same step via "Continue
 * application", not a resume-in-place. */
export const FormbricksProposalProgress: FC<
  FormbricksProposalProgressProps
> = ({ proposal, refetch }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: progress, isLoading } = useQuery({
    queryKey: ['FormbricksProgress', proposal.uuid],
    queryFn: () =>
      proposalProposalsFormbricksProgressRetrieve({
        path: { uuid: proposal.uuid },
      }).then(
        (response) => response.data as unknown as FormbricksProgressResponse,
      ),
    // The Lead can finish a step in another tab/window (or come back
    // later) without this page knowing - refetch on focus so "Continue
    // application" always points at the real next step.
    refetchOnWindowFocus: true,
  });

  const handleEdit = async (stepKey: string) => {
    setEditingStep(stepKey);
    try {
      const { data } = await proposalProposalsFormbricksEditLinkRetrieve({
        path: { uuid: proposal.uuid },
        query: { step: stepKey },
      });
      window.location.assign(
        (data as unknown as FormbricksEditLinkResponse).redirect_url,
      );
    } catch (error) {
      showErrorResponse(error, translate('Unable to open edit link.'));
      setEditingStep(null);
    }
  };

  const handleContinue = () => {
    if (progress?.next_step) {
      window.location.assign(progress.next_step.redirect_url);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await proposalProposalsSubmit({ path: { uuid: proposal.uuid } });
      refetch?.();
      showSuccess(translate('Proposal submitted successfully'));
    } catch (error) {
      showErrorResponse(error, translate('Unable to submit proposal.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body>
        <ResourceRequestsSummary proposal={proposal} />
        <TeamSection
          scope={proposal}
          roleTypes={['proposal']}
          title={translate('Project team')}
        />
        <FormResponsesSection
          formResponses={(proposal as any).form_responses}
        />
        {!progress?.completed_steps?.length && (
          <p className="text-muted">
            {translate(
              'No steps completed yet - start with the first step below.',
            )}
          </p>
        )}
      </SidebarLayout.Body>
      <SidebarLayout.Sidebar transparent>
        <Panel
          title={translate('Application progress')}
          cardBordered
          className="mb-5"
        >
          {progress?.completed_steps.length > 0 && (
            <ul className="list-unstyled mb-5">
              {progress.completed_steps.map((stepKey) => (
                <li
                  key={stepKey}
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>{STEP_LABELS[stepKey] ?? stepKey}</span>
                  <BaseButton
                    variant="text-primary"
                    size="sm"
                    disabled={editingStep === stepKey}
                    disabledReason={translate('Opening edit link…')}
                    onClick={() => handleEdit(stepKey)}
                    label={translate('Edit Form')}
                  />
                </li>
              ))}
            </ul>
          )}
          {progress?.next_step ? (
            <BaseButton
              variant="primary"
              className="w-100"
              onClick={handleContinue}
              label={translate('Continue application')}
            />
          ) : (
            <>
              <p className="text-muted">
                {translate(
                  'All steps are complete. Add team members in the Project team section if needed, then submit your application.',
                )}
              </p>
              <BaseButton
                variant="primary"
                className="w-100"
                pending={isSubmitting}
                onClick={handleSubmit}
                label={translate('Submit')}
              />
            </>
          )}
        </Panel>
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
