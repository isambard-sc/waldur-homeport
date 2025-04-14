import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { TeamSection } from '@waldur/proposals/team/TeamSection';
import { Proposal, ProposalReview } from '@waldur/proposals/types';

export const ReviewTeamStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  const onAddCommentClick = props.params?.onAddCommentClick;
  const reviews: ProposalReview[] = props.params?.reviews;
  const readOnlyMode = props.params?.readOnly;

  return (
    <TeamSection
      id={props.id}
      scope={proposal}
      roleTypes={['proposal']}
      title={translate('Project team')}
      reviews={reviews}
      onAddCommentClick={onAddCommentClick}
      readOnlyMode={readOnlyMode}
    />
  );
};
