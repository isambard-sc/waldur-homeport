import {
  ArrowUUpLeftIcon,
  ChatTextIcon,
  CheckCircleIcon,
  PencilSimpleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import {
  ActionsDropdown,
  ActionsDropdownComponent,
} from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { useProposalDecisionActions } from './create/utils';

const CreateReviewDialog = lazyComponent(() =>
  import('./create-review/CreateReviewDialog').then((module) => ({
    default: module.CreateReviewDialog,
  })),
);

const ModifyAllocationDialog = lazyComponent(() =>
  import('./ModifyAllocationDialog').then((module) => ({
    default: module.ModifyAllocationDialog,
  })),
);

export const ProposalRowActions = ({ row, refetch }) => {
  const user = useSelector(getUser);
  const canCreateReview =
    hasPermission(user, {
      permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
      scopeId: row.call_uuid,
      callOrganizerId: row.call_managing_organisation_uuid,
    }) && !['draft', 'accepted', 'rejected', 'canceled'].includes(row.state);

  const dispatch = useDispatch();

  const openCreateReviewDialog = useCallback(
    (proposal) =>
      dispatch(
        openModalDialog(CreateReviewDialog, {
          resolve: { proposal, refetch },
          size: 'lg',
        }),
      ),
    [dispatch, refetch],
  );

  const openModifyAllocationDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ModifyAllocationDialog, {
          resolve: { proposal: row, refetch },
          size: 'lg',
        }),
      ),
    [dispatch, row, refetch],
  );

  const {
    canPerformDecisionActions,
    handleApproveProposal,
    handleRejectProposal,
    handleReturnToApplicant,
  } = useProposalDecisionActions(row, refetch);

  if (!canPerformDecisionActions && !canCreateReview) {
    return <ActionsDropdown disabled tooltip />;
  }

  return (
    <ActionsDropdownComponent>
      {canCreateReview && (
        <ActionItem
          title={translate('Create review')}
          action={() => openCreateReviewDialog(row)}
          iconNode={<ChatTextIcon weight="bold" />}
        />
      )}
      {canPerformDecisionActions && (
        <>
          <ActionItem
            title={translate('Approve')}
            action={handleApproveProposal}
            iconNode={<CheckCircleIcon weight="bold" />}
            disabled={!canPerformDecisionActions}
          />

          <ActionItem
            title={translate('Modify allocation')}
            action={openModifyAllocationDialog}
            iconNode={<PencilSimpleIcon weight="bold" />}
            disabled={!canPerformDecisionActions}
          />

          <ActionItem
            title={translate('Reject')}
            action={handleRejectProposal}
            iconNode={<XCircleIcon weight="bold" />}
            disabled={!canPerformDecisionActions}
            className="text-danger"
            iconColor="danger"
          />

          <ActionItem
            title={translate('Return to Applicant')}
            action={handleReturnToApplicant}
            iconNode={<ArrowUUpLeftIcon weight="bold" />}
            disabled={!canPerformDecisionActions}
            className="text-warning"
            iconColor="warning"
          />
        </>
      )}
    </ActionsDropdownComponent>
  );
};
