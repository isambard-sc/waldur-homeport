import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';

interface ReturnableProposal {
  call_uuid?: string;
  call_managing_organisation_uuid?: string;
}

/**
 * Who may return a proposal to its applicant and move the deadline: those
 * who may approve and reject proposals in its call (on the call or its
 * managing organisation), and staff. Mirrors the backend's
 * can_decide_proposal, which has the last word.
 */
export const canReturnProposal = (
  user: Parameters<typeof hasPermission>[0],
  proposal: ReturnableProposal,
): boolean =>
  Boolean(user) &&
  Boolean(
    user.is_staff ||
    hasPermission(user, {
      permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    }),
  );

/** The states a proposal can be returned from. */
export const isReturnable = (state: string | undefined): boolean =>
  state === 'submitted' || state === 'in_review';

export const PROPOSAL_RETURNS_QUERY_KEY = 'ProposalReturns';

/** Whether a resubmission deadline has passed. */
export const isOverdue = (resubmitBy: string | null | undefined): boolean =>
  Boolean(resubmitBy) && new Date(resubmitBy) < new Date();
