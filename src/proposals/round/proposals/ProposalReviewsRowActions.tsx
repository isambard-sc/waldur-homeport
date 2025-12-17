import { ProposalReview } from 'waldur-js-client';
import { useSelector } from 'react-redux';

import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { getUser } from '@waldur/workspace/selectors';

import { ReviewDeleteAction } from '../../review/ReviewDeleteAction';
import { ShowReviewCommentsAction } from './ShowReviewCommentsAction';

type ProposalReviewsRowActionsProps = {
  row: ProposalReview;
  fetch?;
};

export const ProposalReviewsRowActions = ({
  row,
  fetch,
}: ProposalReviewsRowActionsProps) => {
  const user = useSelector(getUser);
  const canDelete = hasPermission(user, {
    permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
    scopeId: row.call_uuid,
    callOrganizerId: row.call_managing_organisation_uuid,
  });

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[ShowReviewCommentsAction, canDelete && ReviewDeleteAction].filter(
        Boolean,
      )}
    />
  );
};
