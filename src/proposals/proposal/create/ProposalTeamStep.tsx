import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { TeamSection } from '@waldur/proposals/team/TeamSection';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

export const ProposalTeamStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const change = props.params?.change;
  const reviews: ProposalReview[] = props.params?.reviews;

  return (
    <TeamSection
      id={props.id}
      scope={proposal}
      roleTypes={['proposal']}
      title={translate('Project team')}
      change={change}
      reviews={reviews}
    />
  );
};
