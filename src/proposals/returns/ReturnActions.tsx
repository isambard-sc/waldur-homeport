import { ArrowUUpLeftIcon, CalendarPlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Proposal } from '@/proposals/types';
import { useUser } from '@/workspace/hooks';

import { canReturnProposal, isReturnable } from './permissions';
import { useProposalReturns } from './ProposalReturnsSection';

const ReturnToApplicantDialog = lazyComponent(() =>
  import('./ReturnToApplicantDialog').then((module) => ({
    default: module.ReturnToApplicantDialog,
  })),
);

const ExtendReturnDialog = lazyComponent(() =>
  import('./ExtendReturnDialog').then((module) => ({
    default: module.ExtendReturnDialog,
  })),
);

/**
 * The call team's return actions on a proposal: return a submitted one to
 * its applicant, or move the deadline of one that is back with them.
 */
export const ReturnActions: FC<{ proposal: Proposal; refetch(): void }> = ({
  proposal,
  refetch,
}) => {
  const user = useUser();
  const { openDialog } = useModal();
  const allowed = canReturnProposal(user, proposal);
  const isDraft = proposal.state === 'draft';
  // The open return, if any: its deadline is what Extend starts from.
  const { data: returns } = useProposalReturns(
    proposal.uuid,
    allowed && isDraft,
  );
  const openReturn = isDraft ? returns?.find((item) => item.is_open) : null;

  if (!allowed) return null;

  return (
    <>
      {isReturnable(proposal.state) && (
        <BaseButton
          variant="tertiary"
          onClick={() =>
            openDialog(ReturnToApplicantDialog, {
              resolve: { proposal, refetch },
            })
          }
          className="w-100 mt-2"
          iconNode={<ArrowUUpLeftIcon weight="bold" />}
          label={translate('Return to applicant')}
          size="lg"
        />
      )}
      {openReturn && (
        <BaseButton
          variant="tertiary"
          onClick={() =>
            openDialog(ExtendReturnDialog, {
              resolve: {
                proposal,
                resubmitBy: openReturn.resubmit_by,
                refetch,
              },
            })
          }
          className="w-100 mt-2"
          iconNode={<CalendarPlusIcon weight="bold" />}
          label={translate('Extend the deadline')}
          size="lg"
        />
      )}
    </>
  );
};
