import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { RoundReviewersListExpandableRow } from '@waldur/proposals/round/reviewers/RoundReviewersListExpandableRow';
import { Reviewer, Round } from '@waldur/proposals/types';
import { createFetcher, Table, useTable } from '@waldur/table';

interface RoundReviewersListProps {
  round: Round;
}

export const RoundReviewersList: FC<RoundReviewersListProps> = (props) => {
  const tableProps = useTable({
    table: 'RoundReviewersList',
    fetchData: createFetcher(`call-rounds/${props.round.uuid}/reviewers`),
  });

  return (
    <Table<Reviewer>
      {...tableProps}
      id="reviewers"
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => <>{row.full_name || '-'} </>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.email || '-'} </>,
        },
      ]}
      title={translate('Reviewers')}
      verboseName={translate('Reviewers')}
      expandableRow={RoundReviewersListExpandableRow}
    />
  );
};
