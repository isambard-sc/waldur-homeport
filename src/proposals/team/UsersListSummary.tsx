import { FC } from 'react';

import { createFetcher, useTable } from '@waldur/table';

import { FieldReviewComments } from '../proposal/create-review/FieldReviewComments';

import { UsersList } from './UsersList';

export const UsersListSummary: FC<{ scope; title; reviews? }> = (props) => {
  const usersTable = useTable({
    table: `UserList${props.title}`,
    fetchData: createFetcher(`${props.scope.url}list_users`),
  });
  return (
    <UsersList
      table={usersTable}
      scope={props.scope}
      hideRole={false}
      readOnly
      tableFooter={
        <FieldReviewComments reviews={props.reviews} fieldName="comment_team" />
      }
    />
  );
};
