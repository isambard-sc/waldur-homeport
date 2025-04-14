import { FC } from 'react';

import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

import { FieldReviewComments } from '../proposal/create-review/FieldReviewComments';

import { UsersList } from './UsersList';

export const ProposalUsersListSummary: FC<{ scope; reviews? }> = (props) => {
  const usersTable = useTable({
    table: `ProposalUsersList`,
    fetchData: createFetcher(
      `proposal-proposals/${props.scope.uuid}/list_users`,
    ),
  });
  return (
    <UsersList
      table={usersTable}
      scope={props.scope}
      hideRole={false}
      readOnly
      tableFooter={
        <FieldReviewComments
          reviews={props.reviews}
          fieldName="comment_team"
          space={0}
        />
      }
    />
  );
};
