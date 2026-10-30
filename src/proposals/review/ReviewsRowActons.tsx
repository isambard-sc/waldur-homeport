import { useCurrentStateAndParams } from '@uirouter/react';

import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { canReturnProposal } from '@/proposals/returns/permissions';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { ReviewDeleteAction } from './ReviewDeleteAction';
import { ReviewReturnAction } from './ReviewReturnAction';
import { ReviewViewAction } from './ReviewViewAction';

export const ReviewsRowActions = ({ row, fetch }) => {
  const { state } = useCurrentStateAndParams();

  const user = useUser();
  const canDelete = hasPermission(user, {
    permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
    scopeId: row.call_uuid,
    callOrganizerId: row.call_managing_organisation_uuid,
  });
  const showActions =
    canDelete ||
    (row.state === 'submitted' && canReturnProposal(user, row)) ||
    state.name === 'call-management.review-list' ||
    row.state === 'in_review';
  if (!showActions) {
    return <ActionsDropdown disabled tooltip />;
  }

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        ReviewViewAction,
        ReviewReturnAction,
        canDelete && ReviewDeleteAction,
      ].filter(Boolean)}
    />
  );
};
