import { ChatText, CheckCircle, Eye, XCircle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  proposalProposalsApprove,
  proposalProposalsReject,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { router } from '@waldur/router';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

const CreateReviewDialog = lazyComponent(() =>
  import('./create-review/CreateReviewDialog').then((module) => ({
    default: module.CreateReviewDialog,
  })),
);

const linkToProposalDetails = (proposalUuid, callManagerUuid) =>
  router.stateService.go('call-management.proposal-details', {
    proposal_uuid: proposalUuid,
    // if the parent component is not in organization scope, call managing organization's customer uuid is needed for routing
    ...(callManagerUuid !== undefined && { uuid: callManagerUuid }),
  });

export const ProposalRowActions = ({ row, refetch }) => {
  const isStaff = useSelector(isStaffSelector);
  const isRejectButtonDisabled = !['submitted', 'in_review'].includes(
    row.state,
  );

  const dispatch = useDispatch();

  const openCreateReviewDialog = useCallback(
    (proposal) =>
      dispatch(
        openModalDialog(CreateReviewDialog, {
          resolve: { proposal },
          size: 'md',
        }),
      ),
    [dispatch],
  );

  const handleRejectProposal = async (proposalUuid: string) => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to reject the proposal: {name}?', {
        name: row.name,
      }),
    );
    try {
      await proposalProposalsReject({ path: { uuid: proposalUuid } });
      dispatch(showSuccess(translate('Proposal has been rejected.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to reject the proposal.')),
      );
    }
  };
  const handleApproveProposal = async (proposalUuid: string) => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate(
        'Are you sure you want to approve the proposal {name} in state {state}?',
        {
          name: row.name,
          state: row.state,
        },
      ),
    );
    try {
      await proposalProposalsApprove({ path: { uuid: proposalUuid } });
      dispatch(showSuccess(translate('Proposal has been approved.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to approve the proposal.')),
      );
    }
  };
  return (
    <ActionsDropdownComponent>
      <ActionItem
        title={translate('View')}
        action={() => linkToProposalDetails(row.uuid, row.call_manager_uuid)}
        iconNode={<Eye weight="bold" />}
      />
      {isStaff && (
        <ActionItem
          title={translate('Create review')}
          action={() => openCreateReviewDialog(row)}
          iconNode={<ChatText weight="bold" />}
        />
      )}
      {!isRejectButtonDisabled && (
        <>
          <ActionItem
            title={translate('Approve')}
            action={() => handleApproveProposal(row.uuid)}
            iconNode={<CheckCircle weight="bold" />}
            disabled={isRejectButtonDisabled}
          />
          <ActionItem
            title={translate('Reject')}
            action={() => handleRejectProposal(row.uuid)}
            iconNode={<XCircle weight="bold" />}
            disabled={isRejectButtonDisabled}
            className="text-danger"
            iconColor="danger"
          />
        </>
      )}
    </ActionsDropdownComponent>
  );
};
