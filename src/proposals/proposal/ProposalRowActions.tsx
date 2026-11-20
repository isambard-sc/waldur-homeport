import { ArrowUUpLeftIcon, ChatTextIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import {
  canReturnProposal,
  isReturnable,
} from '@/proposals/returns/permissions';
import { Call } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import {
  CreateManualAssignmentDialog,
  useCanCreateReview,
} from './create/utils';
import { DownloadProposalPdfAction } from './DownloadProposalPdfAction';
import { ReviewProposalMyselfAction } from './ReviewProposalMyselfAction';

const ReturnToApplicantDialog = lazyComponent(() =>
  import('@/proposals/returns/ReturnToApplicantDialog').then((module) => ({
    default: module.ReturnToApplicantDialog,
  })),
);

// Decisions live on the detail page's workflow steps. What is left here is
// starting a manual review, returning the proposal to its applicant, and
// taking it away as a document.
export const ProposalRowActions = ({ row, refetch }) => {
  const { openDialog } = useModal();

  const canCreateReview = useCanCreateReview(row);
  const user = useUser();
  const canReturn = isReturnable(row.state) && canReturnProposal(user, row);

  // Never empty now: the document is always available.
  return (
    <ActionsMenu>
      {canCreateReview && (
        <>
          <ActionItem
            title={translate('Create review')}
            action={() =>
              openDialog(CreateManualAssignmentDialog, {
                resolve: {
                  call: { uuid: row.call_uuid } as Call,
                  refetch,
                  initialProposal: row,
                },
                size: 'md',
              })
            }
            iconNode={<ChatTextIcon weight="bold" />}
          />
          <ReviewProposalMyselfAction row={row} refetch={refetch} />
        </>
      )}
      {canReturn && (
        <ActionItem
          title={translate('Return to applicant')}
          action={() =>
            openDialog(ReturnToApplicantDialog, {
              resolve: { proposal: row, refetch },
            })
          }
          iconNode={<ArrowUUpLeftIcon weight="bold" />}
        />
      )}
      <DownloadProposalPdfAction proposal={row} asDropdownItem />
    </ActionsMenu>
  );
};
