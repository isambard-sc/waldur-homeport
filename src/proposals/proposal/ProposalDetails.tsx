import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';

import { ProposalUsersListSummary } from '../team/ProposalUsersListSummary';
import { Proposal, ProposalReview } from '../types';

import { ProjectDetailsSummary } from './create/ProjectDetailsSummary';
import { ProposalDecisionResult } from './create/ProposalDecisionResult';
import { ProposalDetailsOverviewStep } from './create/ProposalDetailsOverviewStep';
import { ResourceRequestsSummary } from './create/ResourceRequestsSummary';
import { createProposalSteps } from './create/steps';

interface ProposalDetails {
  proposal: Proposal;
  reviews?: ProposalReview[];
  isLoading?;
  error?;
  refetch?;
}

export const ProposalDetails = ({
  proposal,
  reviews = [],
  isLoading,
  error,
  refetch,
}: ProposalDetails) => {
  const formSteps = createProposalSteps;

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body className="mb-10">
        {['rejected', 'accepted'].includes(proposal.state) && (
          <ProposalDecisionResult proposal={proposal} reviews={reviews} />
        )}
        <ProposalDetailsOverviewStep id="step-general" params={{ proposal }} />
        <ProjectDetailsSummary proposal={proposal} reviews={reviews} />
        <ResourceRequestsSummary proposal={proposal} reviews={reviews} />
        <div id="step-team">
          <ProposalUsersListSummary scope={proposal} reviews={reviews} />
        </div>
      </SidebarLayout.Body>
      <SidebarLayout.Sidebar transparent>
        <Panel title={translate('Progress')} cardBordered className="mb-5">
          <FormSteps steps={formSteps} />
        </Panel>
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};
