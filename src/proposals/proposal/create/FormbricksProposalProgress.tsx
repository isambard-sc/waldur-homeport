import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  proposalProposalsFormbricksEditLinkRetrieve,
  proposalProposalsFormbricksProgressRetrieve,
  proposalProposalsSubmit,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import {
  FormResponsesSection,
  STEP_LABELS,
} from '@waldur/proposals/proposal/FormResponsesSection';
import { TeamSection } from '@waldur/proposals/team/TeamSection';
import { Proposal } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
 * proposal.state === 'draft' for calls with call.formbricks_flow_key set.
 * Tracking is at step granularity, not sub-step: a step only shows as
 * completed once Formbricks has actually finished it (a FormStepResponse
 * row exists server-side) - a Lead who started but didn't submit a step
 * gets sent back to a fresh copy of that same step via "Continue
 * application", not a resume-in-place. */
export const FormbricksProposalProgress: FC<
  FormbricksProposalProgressProps
> = ({ proposal, refetch }) => {
  const dispatch = useDispatch();
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: progress, isLoading } = useQuery({
    queryKey: ['FormbricksProgress', proposal.uuid],
    queryFn: () =>
      proposalProposalsFormbricksProgressRetrieve({
        path: { uuid: proposal.uuid },
      }).then((response) => response.data as unknown as FormbricksProgressResponse),
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
      window.location.assign((data as unknown as FormbricksEditLinkResponse).redirect_url);
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to open edit link.')));
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
      dispatch(showSuccess(translate('Proposal submitted successfully')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to submit proposal.')));
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
                  <Button
                    variant="link"
                    size="sm"
                    disabled={editingStep === stepKey}
                    onClick={() => handleEdit(stepKey)}
                  >
                    {translate('Edit Form')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {progress?.next_step ? (
            <Button
              variant="primary"
              className="w-100"
              onClick={handleContinue}
            >
              {translate('Continue application')}
            </Button>
          ) : (
            <>
              <p className="text-muted">
                {translate(
                  'All steps are complete. Add team members in the Project team section if needed, then submit your application.',
                )}
              </p>
              <Button
                variant="primary"
                className="w-100"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {translate('Submit')}
              </Button>
            </>
          )}
        </Panel>
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
