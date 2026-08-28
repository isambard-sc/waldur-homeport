import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Button } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import {
  proposalProposalsFormbricksEditLink,
  proposalProposalsFormbricksProgress,
} from '@waldur/proposals/formbricksApi';
import {
  FormResponsesSection,
  STEP_LABELS,
} from '@waldur/proposals/proposal/FormResponsesSection';
import { Proposal } from '@waldur/proposals/types';
import { useNotify } from '@waldur/store/hooks';

interface FormbricksProposalProgressProps {
  proposal: Proposal;
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
> = ({ proposal }) => {
  const { showErrorResponse } = useNotify();
  const [editingStep, setEditingStep] = useState<string | null>(null);

  const { data: progress, isLoading } = useQuery({
    queryKey: ['FormbricksProgress', proposal.uuid],
    queryFn: () =>
      proposalProposalsFormbricksProgress({
        path: { uuid: proposal.uuid },
      }).then((response) => response.data),
    // The Lead can finish a step in another tab/window (or come back
    // later) without this page knowing - refetch on focus so "Continue
    // application" always points at the real next step.
    refetchOnWindowFocus: true,
  });

  const handleEdit = async (stepKey: string) => {
    setEditingStep(stepKey);
    try {
      const { data } = await proposalProposalsFormbricksEditLink({
        path: { uuid: proposal.uuid },
        query: { step: stepKey },
      });
      window.location.assign(data.redirect_url);
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body>
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
                    {translate('Edit in Formbricks')}
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
            <p className="text-muted mb-0">
              {translate(
                'All steps submitted - waiting for your application to finish processing.',
              )}
            </p>
          )}
        </Panel>
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
